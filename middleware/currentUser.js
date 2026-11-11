const User = require('../models/user');

module.exports = async function currentUser(req, res, next) {
  res.locals.currentUser = null;
  if (!req.session.userId) return next();

  try {
    const user = await User.findById(req.session.userId).select('username').lean();
    if (user) res.locals.currentUser = user;
    else delete req.session.userId;
    return next();
  } catch (error) {
    return next(error);
  }
};
