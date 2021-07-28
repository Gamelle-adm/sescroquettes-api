const currentUserRouter = require('express').Router();
const asyncHandler = require('express-async-handler');
const requireCurrentUser = require('../middlewares/requireCurrentUser');
const User = require('../models/user');

// --------- Caption of logged user info --------- //
currentUserRouter.get(
  '/',
  requireCurrentUser,
  asyncHandler(async (req, res) =>
    res.json(User.getSafeAttributes(req.currentUser))
  )
);

module.exports = currentUserRouter;
