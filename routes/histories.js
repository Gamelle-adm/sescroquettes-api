const historiesRouter = require('express').Router();
const History = require('../models/history');
const requireCurrentUser = require('../middlewares/requireCurrentUser');

historiesRouter.get('/', requireCurrentUser, async (req, res) => {
  const { id } = req.currentUser;
  if (req.currentUser) {
    try {
      const historyData = await History.findHistories(id);
      return res.json(historyData);
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .send("Il y a eu une erreur lors de la récupération de l'historique");
    }
  } else {
    return res.json([]);
  }
});

historiesRouter.post('/', requireCurrentUser, (req, res) => {
  const userId = req.currentUser.id;
  const { foodId } = req.body;

  return History.createHistory({ filters: { userId, foodId } })
    .then((history) => {
      res.json(history);
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .send("Il y a eu une erreur lors de l'enregistrement de l'historique");
    });
});

module.exports = historiesRouter;
