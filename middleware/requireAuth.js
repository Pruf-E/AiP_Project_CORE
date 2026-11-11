module.exports = function requireAuth(req, res, next) {
  if (!req.session.userId) {
    req.session.returnTo = req.originalUrl;
    req.session.flash = { type: 'info', message: 'Войдите, чтобы продолжить.' };
    return res.redirect('/login');
  }
  return next();
};
