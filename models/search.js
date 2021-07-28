const db = require('../db');

const pagination = ({ limit, offset }) => {
  const take = parseInt(limit, 10);
  const skip = parseInt(offset, 10);

  return Promise.all([db.food.findMany({ take, skip }), db.food.count()]);
};

const findBrands = () => {
  return db.food.findMany({
    // take: 10,
    distinct: ['brand'],
    orderBy: [
      {
        brand: 'asc',
      },
    ],
    select: {
      brand: true,
    },
    where: {
      NOT: {
        brand: {
          equals: '',
        },
      },
    },
  });
};

const findTypes = () => {
  return db.foodType.findMany({
    distinct: ['name'],
    orderBy: [
      {
        name: 'asc',
      },
    ],
  });
};

const findAnimalCategories = () => {
  return db.animalCategory.findMany({
    distinct: ['name'],
    orderBy: [
      {
        name: 'asc',
      },
    ],
  });
};

const findProducts = async ({
  filters: { brand, foodTypeId, animalCategoryId, searchedWords },
}) => {
  const words = searchedWords
    ? searchedWords.split(' ').filter((word) => word !== '')
    : [];

  return db.food.findMany({
    where: {
      brand,
      animalCategoryId: animalCategoryId
        ? parseInt(animalCategoryId, 10)
        : undefined,
      foodTypeId: foodTypeId ? parseInt(foodTypeId, 10) : undefined,
      AND: words.map((word) => ({ name: { contains: word } })),
    },
  });
};

module.exports = {
  findProducts,
  findBrands,
  findTypes,
  findAnimalCategories,
  pagination,
};
