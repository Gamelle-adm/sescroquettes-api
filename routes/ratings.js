const RatingsRouter = require('express').Router();
const asyncHandler = require('express-async-handler');
const Rating = require('../models/rating');
const requireCurrentUser = require('../middlewares/requireCurrentUser');

RatingsRouter.post(
  '/:foodId',
  requireCurrentUser,
  asyncHandler(async (req, res) => {
    const { id } = req.currentUser;
    const { appetance, selle, digestion, reviews, postedAt } = req.body;
    const foodId = parseInt(req.params.foodId, 10);

    try {
      const newRating = await Rating.createRat({
        appetance,
        selle,
        digestion,
        userId: id,
        reviews,
        foodId,
        postedAt,
      });
      res.status(200).send(newRating);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  })
);

RatingsRouter.get(
  '/:foodId',
  asyncHandler(async (req, res) => {
    const foodId = parseInt(req.params.foodId, 10);
    try {
      const allRating = await Rating.findOneRating(foodId);
      res.status(200).send({
        ...allRating,
        ratingMean: parseFloat(
          (
            Math.floor(
              ((allRating.digestion + allRating.selle + allRating.appetance) /
                3) *
                2
            ) / 2
          ).toFixed(1)
        ),
        foodId,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  })
);

module.exports = RatingsRouter;
