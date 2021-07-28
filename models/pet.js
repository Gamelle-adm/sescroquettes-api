const db = require('../db');
const { API_BACK } = require('../env');

const findOne = async(id) => {
  const pet = await db.animal.findUnique({
    where: { id },
    include: { AnimalCategories: true, Breeds: true },
  });

  if (pet) {
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
  }
  return {};
};

const findBreeds = () => {
  return db.breed.findMany({
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

const createPet = async ({
  ownerId,
  avatarUrl,
  name,
  breedId,
  animalCategoryId,
}) => {
  return db.animal.create({
    data: {
      ownerId,
      name,
      breedId,
      animalCategoryId,
      avatarUrl:
        typeof avatarUrl === 'string'
          ? avatarUrl.replace(`${API_BACK}/`, '')
          : avatarUrl,
    },
  });
};

const updatePet = async (
  id,
  { name, breedId, animalCategoryId, avatarUrl }
) => {
  return db.animal.update({
    where: { id: parseInt(id, 10) },
    data: {
      name,
      breedId: parseInt(breedId, 10),
      animalCategoryId: parseInt(animalCategoryId, 10),
      avatarUrl:
        typeof avatarUrl === 'string'
          ? avatarUrl.replace(`${API_BACK}/`, '')
          : avatarUrl,
    },
  });
};

const findPetFavorites = async (id) => {
  return db.animalFavoriteFood.findMany({
    where: {
      animalId: parseInt(id, 10),
    },
    include: {
      Favorites: { include: { Foods: true } },
    },
  });
};

const addFavorite = async ({ animalId, favoriteId }) => {
  return db.animalFavoriteFood.create({
    data: {
      animalId,
      favoriteId,
    },
  });
};

const destroyFavorite = (id) => {
  return db.animalFavoriteFood
    .delete({ where: { id: parseInt(id, 10) } })
    .then(() => true)
    .catch(() => false);
};

const destroy = (id) =>
  db.animal
    .delete({ where: { id: parseInt(id, 10) } })
    .then(() => true)
    .catch(() => false);

module.exports = {
  findBreeds,
  findAnimalCategories,
  createPet,
  findOne,
  updatePet,
  findPetFavorites,
  addFavorite,
  destroyFavorite,
  destroy,
};
