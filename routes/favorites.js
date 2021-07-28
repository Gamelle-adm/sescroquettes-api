const favoritesRouter = require('express').Router();
const expressAsyncHandler = require('express-async-handler');
const Favorite = require('../models/favorite');
const { RecordNotFoundError } = require('../error-types');
const requireCurrentUser = require('../middlewares/requireCurrentUser');

favoritesRouter.get('/', requireCurrentUser, async (req, res) => {
  if (req.currentUser) {
    const { id } = req.currentUser;
    try {
      const favoriteData = await Favorite.findFavorites(id);
      return res.json(favoriteData);
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .send('Il y a eu une erreur lors de la récupération des favoris');
    }
  } else {
    return res.json([]);
  }
});

favoritesRouter.get('/listfav', requireCurrentUser, async (req, res) => {
  if (req.currentUser) {
    const { id } = req.currentUser;
    try {
      const favoriteData = await Favorite.findListOfFavorites(id);
      return res.json(favoriteData);
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .send('Il y a eu une erreur lors de la récupération des favoris');
    }
  } else {
    return res.json([]);
  }
});

favoritesRouter.delete(
  '/:foodId',
  requireCurrentUser,
  expressAsyncHandler(async (req, res) => {
    const userId = req.currentUser.id;
    const foodId = parseInt(req.params.foodId, 10);
    if (await Favorite.destroy({ userId, foodId })) res.sendStatus(204);
    else throw new RecordNotFoundError();
  })
);

favoritesRouter.post('/', requireCurrentUser, (req, res) => {
  const userId = req.currentUser.id;
  const { foodId } = req.body;

  return Favorite.createFavorite({ filters: { userId, foodId } })
    .then((favorite) => {
      res.json(favorite);
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .send("Il y a eu une erreur lors de l'enregistrement du favori");
    });
});

module.exports = favoritesRouter;
