const currentPetRouter = require('express').Router();
const asyncHandler = require('express-async-handler');
const requireCurrentPet = require('../middlewares/requireCurrentPet');
const Pet = require('../models/pet');

// --------- Caption of logged user info --------- //
currentPetRouter.get(
  '/',
  requireCurrentPet,
  asyncHandler(async (req, res) =>
    res.json(Pet.getSafeAttributes(req.currentPet))
  )
);

module.exports = currentPetRouter;
