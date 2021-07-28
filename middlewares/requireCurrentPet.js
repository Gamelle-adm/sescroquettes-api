const Pet = require('../models/pet');

module.exports = async (req, res, next) => {
  const { petId } = req.session;
  try {
    req.currentPet = await Pet.findOne(petId);
  } catch (err) {
    return res.sendStatus(401);
  }
  return next();
};
