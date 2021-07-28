const searchesRouter = require('express').Router();
const Search = require('../models/search');

searchesRouter.get('/', async (req, res) => {
  const dataToSearches = [];
  await Search.findBrands()
    .then((results) => {
      dataToSearches.push(results);
    })
    .catch((err) => {
      console.log(err);
      dataToSearches.push([]);
      return res
        .status(500)
        .send('Il y a eu une erreur lors de la récupération des marques');
    });

  await Search.findTypes()
    .then((results) => {
      dataToSearches.push(results);
    })
    .catch((err) => {
      console.log(err);
      dataToSearches.push([]);
      return res
        .status(500)
        .send(
          "Il y a eu une erreur lors de la récupération des types d'aliments"
        );
    });

  await Search.findAnimalCategories()
    .then((results) => {
      dataToSearches.push(results);
    })
    .catch((err) => {
      console.log(err);
      dataToSearches.push([]);
      return res
        .status(500)
        .send(
          "Il y a eu une erreur lors de la récupération des catégories d'animaux"
        );
    });
  return res.json(dataToSearches);
});

searchesRouter.post('/', (req, res) => {
  const { brand, foodTypeId, animalCategoryId, searchedWords } = req.body;

  return Search.findProducts({
    filters: {
      brand,
      foodTypeId: foodTypeId || undefined,
      animalCategoryId: animalCategoryId || undefined,
      searchedWords,
    },
  })
    .then((products) => {
      res.json(products);
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .send('Il y a eu une erreur lors de la récupération des produits');
    });
});

module.exports = searchesRouter;
