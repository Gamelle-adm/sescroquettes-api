const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const uniqid = require('uniqid');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
// const requestsToAPI = require('./requestsToAPI');
const User = require('./models/user');
const {
  PORT,
  CORS_ALLOWED_ORIGINS,
  inTestEnv,
  inProdEnv,
  SESSION_COOKIE_SECRET,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_DOMAIN,
  API_BACK,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
} = require('./env');

const sessionStore = require('./sessionStore');

const app = express();

app.set('x-powered-by', false);
app.set('trust proxy', 1);

app.use(express.json());

const allowedOrigins = CORS_ALLOWED_ORIGINS.split(',');
const corsOptions = {
  origin: (origin, callback) => {
    if (origin === undefined || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(
  session({
    key: SESSION_COOKIE_NAME,
    secret: SESSION_COOKIE_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: inProdEnv,
      domain: SESSION_COOKIE_DOMAIN,
      sameSite: true,
    },
  })
);

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      const user = await User.findByEmail(email, false);
      if (user && (await User.verifyPassword(user, password))) {
        return done(null, user);
      }
      return done(null, false);
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${API_BACK}/auth/google/callback`,
    },
    async (accesToken, resfreshToken, profile, done) => {
      try {
        const existingUser = await User.findByGoogleId(profile.id, false);
        if (existingUser) done(null, existingUser);
        else {
          const newPassword = uniqid();
          const newHashedPassword = await User.hashPassword(newPassword);
          const user = await User.googleCreate({
            email: profile._json.email, // eslint-disable-line
            firstname: profile._json.given_name, // eslint-disable-line
            lastname: profile._json.family_name, // eslint-disable-line
            avatarUrl: profile._json.picture, // eslint-disable-line
            googleId: profile.id,
            hashedPassword: newHashedPassword,
            confirmedEmailToken: 'active',
            registeredAt: new Date(),
          });
          done(null, user);
        }
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
      callbackURL: `${API_BACK}/auth/facebook/callback`,
      profileFields: ['name', 'email', 'picture.type(large)'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findByFacebookId(
          profile._json.id, // eslint-disable-line
          false
        );
        if (existingUser) done(null, existingUser);
        else {
          const newPassword = uniqid();
          const newHashedPassword = await User.hashPassword(newPassword);
          const user = await User.facebookCreate({
            email: profile._json.email, // eslint-disable-line
            firstname: profile._json.first_name, // eslint-disable-line
            lastname: profile._json.last_name, // eslint-disable-line
            facebookId: profile._json.id, // eslint-disable-line
            avatarUrl: profile.photos[0].value, // eslint-disable-line
            hashedPassword: newHashedPassword,
            confirmedEmailToken: 'active',
            registeredAt: new Date(),
          });
          done(null, user);
        }
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findOne(id);
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/file-storage', express.static('file-storage'));

require('./routes')(app);

// server setup
const server = app.listen(PORT, () => {
  if (!inTestEnv) {
    console.log(`Server running on port ${PORT}`);
  }
});

// process setup
process.on('unhandledRejection', (error) => {
  console.error('unhandledRejection', JSON.stringify(error), error.stack);
  process.exit(1);
});
process.on('uncaughtException', (error) => {
  console.error('uncaughtException', JSON.stringify(error), error.stack);
  process.exit(1);
});
process.on('beforeExit', () => {
  app.close((error) => {
    if (error) console.error(JSON.stringify(error), error.stack);
  });
});

// requestsToAPI.databaseUpdating();

module.exports = server;
