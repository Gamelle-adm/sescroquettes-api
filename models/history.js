const db = require('../db');

const findHistories = async (id) => {
  const userId = parseInt(id, 10);
  return db.history.findMany({
    orderBy: {
      consultedAt: 'desc',
    },
    where: {
      userId,
    },
    include: {
      Foods: true,
    },
  });
};

const createHistory = async ({ filters: { userId, foodId } }) => {
  const consultedAt = new Date();

  const pk = {
    userId: parseInt(userId, 10),
    foodId: parseInt(foodId, 10),
  };

  return db.history.upsert({
    where: {
      userId_foodId: pk,
    },
    update: { consultedAt },
    create: {
      consultedAt,
      userId,
      foodId,
    },
  });
};

module.exports = {
  createHistory,
  findHistories,
};
