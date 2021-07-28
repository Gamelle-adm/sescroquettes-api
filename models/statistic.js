const db = require('../db');

const createStat = async ({
  filters: {
    userId,
    requestInfo,
    brand,
    foodTypeId,
    animalCategoryId,
    searchText,
    foodId,
    device,
    osName,
    requestSentAt,
    ipv4Address,
  },
}) => {
  return db.statistics.create({
    data: {
      userId,
      requestInfo,
      brand,
      foodTypeId,
      animalCategoryId,
      searchText,
      foodId,
      device,
      osName,
      requestSentAt,
      ipv4Address,
    },
  });
};

const findAllStatistics = async () => {
  return db.statistics.findMany({
    include: {
      Users: {
        select: {
          firstname: true,
          lastname: true,
          email: true,
          role: true,
          registeredAt: true,
        },
      },
      FoodTypes: true,
      AnimalCategories: true,
      Foods: true,
    },
  });
};

const findStatsUsers = async () => {
  return db.statistics.findMany({
    select: {
      userId: true,
    },
    distinct: ['userId'],
  });
};

const findStatsByDates = ({ filters: { statsStartDate, statsEndDate } }) => {
  return db.statistics.findMany({
    orderBy: {
      requestSentAt: 'desc',
    },
    where: {
      requestSentAt: {
        gte: statsStartDate,
        lte: statsEndDate,
      },
    },
    include: {
      Users: {
        select: {
          firstname: true,
          lastname: true,
          email: true,
          role: true,
          registeredAt: true,
        },
      },
      FoodTypes: true,
      AnimalCategories: true,
      Foods: true,
    },
  });
};

const findNbReqByDates = ({ filters: { statsStartDate, statsEndDate } }) => {
  return db.statistics.groupBy({
    by: ['requestInfo'],
    _count: {
      requestInfo: true,
    },
    where: {
      requestSentAt: {
        gte: statsStartDate,
        lte: statsEndDate,
      },
    },
  });
};

const findNbFoodTypesByDates = ({
  filters: { statsStartDate, statsEndDate },
}) => {
  return db.statistics.groupBy({
    by: ['foodTypeId'],
    _count: {
      foodTypeId: true,
    },
    where: {
      requestSentAt: {
        gte: statsStartDate,
        lte: statsEndDate,
      },
      requestInfo: 'search',
      NOT: [{ foodTypeId: null }],
    },
  });
};

const findAnimalCategoriesByDates = ({
  filters: { statsStartDate, statsEndDate },
}) => {
  return db.statistics.groupBy({
    by: ['animalCategoryId'],
    _count: {
      animalCategoryId: true,
    },
    where: {
      requestSentAt: {
        gte: statsStartDate,
        lte: statsEndDate,
      },
      requestInfo: 'search',
      NOT: [{ animalCategoryId: null }],
    },
  });
};

const findDevicesByDates = ({ filters: { statsStartDate, statsEndDate } }) => {
  return db.statistics.groupBy({
    by: ['device'],
    _count: {
      device: true,
    },
    where: {
      requestSentAt: {
        gte: statsStartDate,
        lte: statsEndDate,
      },
      NOT: [{ device: null }],
    },
  });
};

const findOSByDates = ({ filters: { statsStartDate, statsEndDate } }) => {
  return db.statistics.groupBy({
    by: ['osName'],
    _count: {
      osName: true,
    },
    where: {
      requestSentAt: {
        gte: statsStartDate,
        lte: statsEndDate,
      },
      NOT: [{ osName: null }],
    },
  });
};

const findMostShowedProductsByDates = ({
  filters: { statsStartDate, statsEndDate },
}) => {
  return db.statistics.groupBy({
    by: ['foodId'],
    _count: {
      foodId: true,
    },
    orderBy: {
      _count: {
        foodId: 'desc',
      },
    },
    where: {
      requestSentAt: {
        gte: statsStartDate,
        lte: statsEndDate,
      },
      NOT: [{ foodId: null }],
    },
    take: 10,
  });
};

const findCurrentMostFavoriteProducts = () => {
  return db.favorite.groupBy({
    by: ['foodId'],
    _count: {
      foodId: true,
    },
    orderBy: {
      _count: {
        foodId: 'desc',
      },
    },
    take: 10,
  });
};

module.exports = {
  createStat,
  findAllStatistics,
  findStatsByDates,
  findNbReqByDates,
  findMostShowedProductsByDates,
  findCurrentMostFavoriteProducts,
  findNbFoodTypesByDates,
  findAnimalCategoriesByDates,
  findDevicesByDates,
  findOSByDates,
  findStatsUsers,
};
