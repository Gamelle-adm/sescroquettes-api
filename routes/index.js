const authRouter = require('./auth');
const currentUserRouter = require('./currentUser');
const userRouter = require('./users');
const searchesRouter = require('./searches');
const foodsRouter = require('./foods');
const historiesRouter = require('./histories');
const favoritesRouter = require('./favorites');
const petsRouter = require('./pets');
const currentPetRouter = require('./currentPet');
const statisticsRouter = require('./statistics');
const RatingsRouter = require('./ratings');

module.exports = (app) => {
  app.use('/users', userRouter);
  app.use('/auth', authRouter);
  app.use('/currentUser', currentUserRouter);
  app.use('/searches', searchesRouter);
  app.use('/foods', foodsRouter);
  app.use('/histories', historiesRouter);
  app.use('/favorites', favoritesRouter);
  app.use('/pets', petsRouter);
  app.use('/currentPet', currentPetRouter);
  app.use('/statistics', statisticsRouter);
  app.use('/ratings', RatingsRouter);
};
