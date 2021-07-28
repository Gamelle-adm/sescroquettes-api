const argon2 = require('argon2');
const Joi = require('joi');
const JoiPhoneNumber = Joi.extend(require('joi-phone-number'));
// const { RecordNotFoundError } = require('../error-types');
const db = require('../db');
const { API_BACK } = require('../env');

// ---------Creation d'une fonction pour trouver un utilisateur par son email--------- //
const findByEmail = (email) => {
  return db.user.findFirst({ where: { email } });
};

// ---------Creation d'une fonction pour comparer le numero avec un numero déjà existant--------- //
const phoneAlreadyExist = (phone) => {
  return db.user.findFirst({ where: { phone } }).then((User) => !!User);
};

// ---------Creation d'une fonction comparer le mail avec un mail déjà existant--------- //
const emailAlreadyExists = (email) => {
  return db.user.findFirst({ where: { email } }).then((User) => !!User);
};

// ---------Option de hachage du mdp--------- //
const hashingOptions = {
  memoryCost: 2 ** 16,
  timeCost: 5,
  type: argon2.argon2id,
};

const findOne = async (id) => {
  const curUser = await db.user.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      Animals: { include: { AnimalCategories: true, Breeds: true } },
      Rating: { include: { foods: true } },
    },
  });
  let updatedAnimals;
  if (curUser && curUser.Animals) {
    updatedAnimals = await Promise.all(
      curUser.Animals.map((pet) => {
        let { avatarUrl } = pet;
        if (
          avatarUrl &&
          !avatarUrl.startsWith('http://') &&
          !avatarUrl.startsWith('https://')
        ) {
          avatarUrl = `${API_BACK}/${avatarUrl}`;
        }
        return {
          ...pet,
          avatarUrl,
        };
      })
    );
  }

  return { ...curUser, Animals: updatedAnimals };
};

const findAllSafe = () =>
  db.user.findMany({
    select: {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
      role: true,
      registeredAt: true,
    },
  });

const changeUserRole = ({ id, role }) => {
  return db.user.update({
    where: {
      id,
    },
    data: {
      role,
    },
  });
};

const findOneForStats = (id) =>
  db.user.findUnique({
    select: {
      firstname: true,
      lastname: true,
      email: true,
      role: true,
      registeredAt: true,
    },
    where: { id: parseInt(id, 10) },
  });

// const { findMany } = db.user;

// ---------Creation d'une fonction pour hacher le mdp--------- //
const hashPassword = (plainPassword) => {
  return argon2.hash(plainPassword, hashingOptions);
};

// ---------Creation d'une fonction pour creer un user--------- //
const create = async ({
  firstname,
  lastname,
  phone,
  email,
  password,
  registeredAt,
}) => {
  const hashedPassword = await hashPassword(password);
  return db.user.create({
    data: {
      firstname,
      lastname,
      phone,
      email,
      hashedPassword,
      registeredAt,
    },
  });
};

// ---------Creation d'une fonction pour verifier si le mdp entré correspond au mdp crypté--------- //
const verifyPassword = (plainPassword, hashedPassword) => {
  return argon2.verify(hashedPassword, plainPassword, hashingOptions);
};

// ---------Creation d'une fonction pour mettre à jour les données de l'utilisateur--------- //
const update = async (id, data) =>
  db.user.update({
    where: { id: parseInt(id, 10) },
    data: {
      ...data,
      avatarUrl:
        typeof data.avatarUrl === 'string'
          ? data.avatarUrl.replace(`${API_BACK}/`, '')
          : data.avatarUrl,
    },
  });

// ---------Creation d'une fonction validation avec Joi--------- //
const validate = (data, forUpdate = false) =>
  Joi.object({
    firstname: Joi.string()
      .min(1)
      .max(255)
      .presence(forUpdate ? 'optional' : 'required'),
    lastname: Joi.string()
      .min(1)
      .max(255)
      .presence(forUpdate ? 'optional' : 'required'),
    phone: JoiPhoneNumber.string()
      .phoneNumber()
      .min(10)
      .max(20)
      .allow(null, '')
      .optional(),
    email: Joi.string()
      .email()
      .max(255)
      .presence(forUpdate ? 'optional' : 'required'),
    password: Joi.string()
      .min(8)
      .presence(forUpdate ? 'optional' : 'required'),
    registeredAt: Joi.date().presence(forUpdate ? 'optional' : 'required'),
    avatarUrl: Joi.string().max(255).allow(null, ''),
    googleId: Joi.string(),
  }).validate(data, { abortEarly: false }).error;

const getSafeAttributes = (user) => {
  if (user) {
    let { avatarUrl } = user;
    if (
      avatarUrl &&
      !avatarUrl.startsWith('http://') &&
      !avatarUrl.startsWith('https://')
    ) {
      avatarUrl = `${API_BACK}/${avatarUrl}`;
    }
    return {
      ...user,
      avatarUrl,
      hashedPassword: undefined,
    };
  }
  return {};
};

const destroy = (id) =>
  db.user
    .delete({ where: { id: parseInt(id, 10) } })

    .then(() => true)
    .catch(() => false);

const findByGoogleId = (googleId) => {
  return db.user.findFirst({ where: { googleId } });
};

const googleCreate = async ({
  firstname,
  lastname,
  avatarUrl,
  email,
  googleId,
  confirmedEmailToken,
  hashedPassword,
  registeredAt,
}) => {
  return db.user.create({
    data: {
      firstname,
      lastname,
      avatarUrl,
      email,
      googleId,
      confirmedEmailToken,
      hashedPassword,
      registeredAt,
    },
  });
};

const findByFacebookId = (facebookId) => {
  return db.user.findFirst({ where: { facebookId } });
};

const facebookCreate = async ({
  firstname,
  lastname,
  avatarUrl,
  email,
  facebookId,
  confirmedEmailToken,
  hashedPassword,
  registeredAt,
}) => {
  return db.user.create({
    data: {
      firstname,
      lastname,
      avatarUrl,
      email,
      facebookId,
      confirmedEmailToken,
      hashedPassword,
      registeredAt,
    },
  });
};

module.exports = {
  findByEmail,
  emailAlreadyExists,
  phoneAlreadyExist,
  hashPassword,
  create,
  verifyPassword,
  validate,
  findOne,
  // findMany,
  update,
  getSafeAttributes,
  destroy,
  findByGoogleId,
  googleCreate,
  findByFacebookId,
  facebookCreate,
  findOneForStats,
  findAllSafe,
  changeUserRole,
};
