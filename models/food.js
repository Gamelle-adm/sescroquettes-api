const axios = require('axios');
const db = require('../db');
const { API_URL } = require('../env');

const findProduct = async (id) => {
  const idInt = parseInt(id, 10);
  const product = await db.food.findUnique({
    where: {
      id: idInt,
    },
  });
  return product;
};

const findDetails = async (barcode) => {
  return axios
    .get(`${API_URL}/product/${barcode}`)
    .then((response) => response.data.data);
};

const findFoodTypeName = async (id) => {
  const idInt = parseInt(id, 10);
  const product = await db.foodType.findUnique({
    where: {
      id: idInt,
    },
  });
  return product;
};

const findAnimalCategoryName = async (id) => {
  const idInt = parseInt(id, 10);
  const product = await db.animalCategory.findUnique({
    where: {
      id: idInt,
    },
  });
  return product;
};

module.exports = {
  findProduct,
  findDetails,
  findFoodTypeName,
  findAnimalCategoryName,
};
