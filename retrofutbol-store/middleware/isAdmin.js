// middleware/isAdmin.js
module.exports = function isAdmin(req, res, next) {
  if (req.session && req.session.authUser === 'admin') {
    return next();
  }
  return res.redirect('/login');
};

