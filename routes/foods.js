const foodsRouter = require('express').Router();
const Food = require('../models/food');

foodsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Food.findProduct(id).then((result) => {
      return result;
    });

    await Food.findDetails(product.barcode).then((results) => {
      return res.json(results);
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send(
        'Il y a eu une erreur lors de la récupération des détails du produit'
      );
  }
});

foodsRouter.get('/gamelle/:id', async (req, res) => {
  const { id } = req.params;

  Food.findProduct(id).then((result) => {
    res.json(result);
  });
});

module.exports = foodsRouter;
