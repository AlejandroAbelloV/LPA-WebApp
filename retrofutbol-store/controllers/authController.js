// controllers/authController.js
const { logActivity, logError } = require('../middleware/logger');

exports.showLogin = (req, res) => {
  res.render('login', { error: null });
};

exports.login = (req, res) => {
  try {
    const { username, password } = req.body;

    // Admin de demo
    if (username === 'admin' && password === 'admin') {
      req.session.authUser = 'admin';
      logActivity(`Admin login OK: ${username}`);
      return res.redirect('/admin');
    }

    logActivity(`Admin login FAIL: ${username}`);
    return res.status(401).render('login', { error: 'Usuario o contraseña incorrectos' });
  } catch (e) {
    logError(`Admin login error: ${e.message}`);
    return res.status(500).render('login', { error: 'Server error' });
  }
};

exports.logout = (req, res) => {
  const who = req.session?.authUser || 'unknown';
  req.session.authUser = null;
  logActivity(`Admin logout: ${who}`);
  res.redirect('/');
};


