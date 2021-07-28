const publicIp = require('public-ip');
const express = require('express');

const app = express();
const useragent = require('express-useragent');

const deviceDetails = app.use(useragent.express());

const statisticsRouter = require('express').Router();
const Statistic = require('../models/statistic');
const Food = require('../models/food');
const User = require('../models/user');

const requireCurrentUser = require('../middlewares/requireCurrentUser');

statisticsRouter.post('/', deviceDetails, async (req, res) => {
  let device = null;
  if (req.useragent.isMobile) {
    device = 'mobile';
  } else if (req.useragent.isTablet) {
    device = 'tablet';
  } else if (req.useragent.isDesktop) {
    device = 'desktop';
  }
  const osName = req.useragent.os;
  const ipv4Address = (await publicIp.v4()) || null;

  const {
    userId,
    requestInfo,
    brand,
    foodTypeId,
    animalCategoryId,
    searchText,
    foodId,
    requestSentAt,
  } = req.body;

  try {
    const statistic = await Statistic.createStat({
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
    });
    res.json(statistic);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .send(
        "Il y a eu une erreur lors de l'enregistrement de cette statistique"
      );
  }
});

statisticsRouter.get('/', requireCurrentUser, async (req, res) => {
  if (
    req.currentUser &&
    (req.currentUser.role === 'admin' || req.currentUser.role === 'superAdmin')
  ) {
    try {
      const statisticsData = await Statistic.findAllStatistics();
      return res.json(statisticsData);
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .send('Il y a eu une erreur lors de la récupération des statistiques');
    }
  }
  return res
    .status(401)
    .send("Vous n'avez pas l'autorisation de consulter les statistiques");
});

statisticsRouter.post('/fullReqDates', requireCurrentUser, async (req, res) => {
  const { statsStartDate, statsEndDate } = req.body;
  if (
    req.currentUser &&
    (req.currentUser.role === 'admin' || req.currentUser.role === 'superAdmin')
  ) {
    try {
      const statistic = await Statistic.findStatsByDates({
        filters: { statsStartDate, statsEndDate },
      });
      res.json(statistic);
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .send(
          'Il y a eu une erreur lors de la récupération de ces statistiques'
        );
    }
  }
});

statisticsRouter.post(
  '/numberReqDates',
  requireCurrentUser,
  async (req, res) => {
    const { statsStartDate, statsEndDate } = req.body;
    if (
      req.currentUser &&
      (req.currentUser.role === 'admin' ||
        req.currentUser.role === 'superAdmin')
    ) {
      try {
        const statistic = await Statistic.findNbReqByDates({
          filters: { statsStartDate, statsEndDate },
        });
        res.json(statistic);
      } catch (err) {
        console.log(err);
        res
          .status(500)
          .send(
            'Il y a eu une erreur lors de la récupération de ces statistiques'
          );
      }
    }
  }
);

statisticsRouter.post(
  '/numberFoodTypesDates',
  requireCurrentUser,
  async (req, res) => {
    const { statsStartDate, statsEndDate } = req.body;
    if (
      req.currentUser &&
      (req.currentUser.role === 'admin' ||
        req.currentUser.role === 'superAdmin')
    ) {
      try {
        const statistic = await Statistic.findNbFoodTypesByDates({
          filters: { statsStartDate, statsEndDate },
        });

        const statisticWithFood = await Promise.all(
          statistic.map(async (stat) => {
            const product = await Food.findFoodTypeName(stat.foodTypeId).then(
              (result) => {
                return result;
              }
            );
            return { ...stat, ...product };
          })
        );
        res.json(statisticWithFood);
      } catch (err) {
        console.log(err);
        res
          .status(500)
          .send(
            'Il y a eu une erreur lors de la récupération de ces statistiques'
          );
      }
    }
  }
);

statisticsRouter.post(
  '/numberAnimalCategoriesDates',
  requireCurrentUser,
  async (req, res) => {
    const { statsStartDate, statsEndDate } = req.body;
    if (
      req.currentUser &&
      (req.currentUser.role === 'admin' ||
        req.currentUser.role === 'superAdmin')
    ) {
      try {
        const statistic = await Statistic.findAnimalCategoriesByDates({
          filters: { statsStartDate, statsEndDate },
        });
        const statisticWithFood = await Promise.all(
          statistic.map(async (stat) => {
            const product = await Food.findAnimalCategoryName(
              stat.animalCategoryId
            ).then((result) => {
              return result;
            });
            return { ...stat, ...product };
          })
        );
        res.json(statisticWithFood);
      } catch (err) {
        console.log(err);
        res
          .status(500)
          .send(
            'Il y a eu une erreur lors de la récupération de ces statistiques'
          );
      }
    }
  }
);

statisticsRouter.post(
  '/mostShowedProducts',
  requireCurrentUser,
  async (req, res) => {
    const { statsStartDate, statsEndDate } = req.body;
    if (
      req.currentUser &&
      (req.currentUser.role === 'admin' ||
        req.currentUser.role === 'superAdmin')
    ) {
      try {
        const statistic = await Statistic.findMostShowedProductsByDates({
          filters: { statsStartDate, statsEndDate },
        });

        const statisticWithFood = await Promise.all(
          statistic.map(async (stat) => {
            const product = await Food.findProduct(stat.foodId).then(
              (result) => {
                return result;
              }
            );
            return { ...stat, ...product };
          })
        );
        res.json(statisticWithFood);
      } catch (err) {
        console.log(err);
        res
          .status(500)
          .send(
            'Il y a eu une erreur lors de la récupération de ces statistiques'
          );
      }
    }
  }
);

statisticsRouter.post(
  '/currentMostFavoriteProducts',
  requireCurrentUser,
  async (req, res) => {
    if (
      req.currentUser &&
      (req.currentUser.role === 'admin' ||
        req.currentUser.role === 'superAdmin')
    ) {
      try {
        const statistic = await Statistic.findCurrentMostFavoriteProducts();

        const statisticWithFood = await Promise.all(
          statistic.map(async (stat) => {
            const product = await Food.findProduct(stat.foodId).then(
              (result) => {
                return result;
              }
            );
            return { ...stat, ...product };
          })
        );
        res.json(statisticWithFood);
      } catch (err) {
        console.log(err);
        res
          .status(500)
          .send(
            'Il y a eu une erreur lors de la récupération de ces statistiques'
          );
      }
    }
  }
);

statisticsRouter.post('/devicesUsed', requireCurrentUser, async (req, res) => {
  const { statsStartDate, statsEndDate } = req.body;
  if (
    req.currentUser &&
    (req.currentUser.role === 'admin' || req.currentUser.role === 'superAdmin')
  ) {
    try {
      const statistic = await Statistic.findDevicesByDates({
        filters: { statsStartDate, statsEndDate },
      });
      res.json(statistic);
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .send(
          'Il y a eu une erreur lors de la récupération de ces statistiques'
        );
    }
  }
});

statisticsRouter.post('/OSUsed', requireCurrentUser, async (req, res) => {
  const { statsStartDate, statsEndDate } = req.body;
  if (
    req.currentUser &&
    (req.currentUser.role === 'admin' || req.currentUser.role === 'superAdmin')
  ) {
    try {
      const statistic = await Statistic.findOSByDates({
        filters: { statsStartDate, statsEndDate },
      });
      res.json(statistic);
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .send(
          'Il y a eu une erreur lors de la récupération de ces statistiques'
        );
    }
  }
});

// findStatsUsers
statisticsRouter.get(
  '/usersOrderDesc',
  requireCurrentUser,
  async (req, res) => {
    if (
      req.currentUser &&
      (req.currentUser.role === 'admin' ||
        req.currentUser.role === 'superAdmin')
    ) {
      try {
        const statistic = await Statistic.findStatsUsers();
        const statisticWithUserDetails = await Promise.all(
          statistic.map(async (stat) => {
            const user = await User.findOneForStats(stat.userId).then(
              (result) => {
                return result;
              }
            );
            return { ...stat, ...user };
          })
        );

        res.json(statisticWithUserDetails);
      } catch (err) {
        console.log(err);
        res
          .status(500)
          .send(
            'Il y a eu une erreur lors de la récupération de ces statistiques'
          );
      }
    }
  }
);

module.exports = statisticsRouter;
