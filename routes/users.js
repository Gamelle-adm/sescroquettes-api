const _ = require('lodash');
const usersRouter = require('express').Router();
const expressAsyncHandler = require('express-async-handler');
const uniqid = require('uniqid');
const requireCurrentUser = require('../middlewares/requireCurrentUser');
const handleImageUpload = require('../middlewares/handleImageUpload');
const emailer = require('../mailer');
const User = require('../models/user');
const { ValidationError, RecordNotFoundError } = require('../error-types');
const tryDeleteFile = require('../helpers/tryDeleteFile');
const {
  RESET_PASSWORD_FRONT_URL,
  EMAIL_SENDER,
  CONFIRMED_EMAIL_FRONT_URL,
} = require('../env');

usersRouter.get('/', requireCurrentUser, async (req, res) => {
  const { id } = req.currentUser;
  if (req.currentUser) {
    try {
      const UsersData = await User.findAllSafe(id);
      return res.json(UsersData);
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .send(
          'Il y a eu une erreur lors de la récupération de la liste des utilisateurs'
        );
    }
  } else {
    return res.json([]);
  }
});

usersRouter.post('/updateRole', requireCurrentUser, async (req, res) => {
  const { id, role } = req.body;
  if (req.currentUser && req.currentUser.role === 'superAdmin') {
    try {
      await User.changeUserRole({ id, role });
      return res.sendStatus(200);
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .send(
          "Il y a eu une erreur lors de la mise à jour du rôle de l'utilisateur"
        );
    }
  } else {
    return res.json([]);
  }
});

usersRouter.post('/', async (req, res) => {
  const validationError = User.validate(req.body);
  if (validationError)
    return res.status(422).send({ errors: validationError.details });
  if (await User.emailAlreadyExists(req.body.email))
    return res.status(422).send({ error: 'This email is already taken !' });
  if (req.body.phone && (await User.phoneAlreadyExist(req.body.phone)))
    return res
      .status(422)
      .send({ error: 'This phone number is already taken !' });
  const newUser = await User.create(req.body);
  if (newUser && (await User.findByEmail(req.body.email))) {
    const token = uniqid();
    const hashedToken = await User.hashPassword(token);
    await User.update(newUser.id, { confirmedEmailToken: hashedToken });

    const mailContent = `${CONFIRMED_EMAIL_FRONT_URL}?userId=${newUser.id}&token=${token}`;
    await emailer.sendMail(
      {
        from: EMAIL_SENDER,
        to: newUser.email,
        subject: 'Confirmation de votre compte',
        text: mailContent,
        html: `<a href="${mailContent}">Appuyer sur ce lien pour confirmer votre compte</a>`,
      },
      (err, info) => {
        if (err) console.error(err);
        else console.log(info);
      }
    );
  }
  return res.status(201).send(User.getSafeAttributes(newUser));
});

usersRouter.post(
  '/validated-email',
  expressAsyncHandler(async (req, res) => {
    const { userId, token } = req.body;
    const user = await User.findOne(userId);
    if (user && (await User.verifyPassword(token, user.confirmedEmailToken))) {
      await User.update(user.id, {
        confirmedEmailToken: 'active',
      });
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  })
);

usersRouter.post(
  '/reset-password-email',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findByEmail(req.body.email);
    if (user) {
      const token = uniqid();
      const hashedToken = await User.hashPassword(token);
      await User.update(user.id, { resetPasswordToken: hashedToken });

      const mailContent = `${RESET_PASSWORD_FRONT_URL}?userId=${user.id}&token=${token}`;
      await emailer.sendMail(
        {
          from: EMAIL_SENDER,
          to: user.email,
          subject: 'Réinitialisation de votre mot de passe',
          text: mailContent,
          html: `<a href="${mailContent}">Appuyer sur ce lien pour réinitialiser votre mot de passe</a>`,
        },
        (err, info) => {
          if (err) console.error(err);
          else console.log(info);
        }
      );
    }
    res.sendStatus(200);
  })
);

usersRouter.post(
  '/reset-password',
  expressAsyncHandler(async (req, res) => {
    const { userId, token, password } = req.body;
    const user = await User.findOne(userId);

    if (user && (await User.verifyPassword(token, user.resetPasswordToken))) {
      const newHashedPassword = await User.hashPassword(password);
      await User.update(user.id, {
        hashedPassword: newHashedPassword,
        resetPasswordToken: null,
      });
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  })
);

usersRouter.patch(
  '/:id',
  requireCurrentUser,
  expressAsyncHandler(async (req, res, next) => {
    if (
      req.currentUser.role === 'superAdmin' ||
      req.currentUser.id.toString() === req.params.id
    )
      next();
    else res.sendStatus(403);
  }),
  handleImageUpload.single('avatar'),
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne(req.params.id);
    const oldAvatarUrl = user.avatarUrl;
    if (!user) throw new RecordNotFoundError('users', req.params.id);
    const data = _.omit(req.body, 'avatar');
    if (req.file && req.file.path) {
      if (req.body.avatarUrl === '') {
        await tryDeleteFile(req.file.path);
      } else {
        data.avatarUrl = req.file.path;
      }
    }

    const error = User.validate(data, true);
    if (error) throw new ValidationError(error.details);
    const updated = await User.update(req.params.id, data);
    if (req.file && req.file.path) {
      await tryDeleteFile(oldAvatarUrl);
    }

    res.send(User.getSafeAttributes(updated));
  })
);

usersRouter.delete(
  '/:id',
  requireCurrentUser,
  expressAsyncHandler(async (req, res, next) => {
    if (
      req.currentUser.role === 'admin' ||
      req.currentUser.id.toString() === req.params.id
    )
      next();
    else res.sendStatus(403);
  }),
  expressAsyncHandler(async (req, res) => {
    if (await User.destroy(req.params.id)) res.sendStatus(204);
    else throw new RecordNotFoundError();
  })
);

module.exports = usersRouter;
