exports.requireLogin = (req, res, next) => {
  if (!req.session.user) return res.redirect('/users/login');
  next();
};
//ktr login