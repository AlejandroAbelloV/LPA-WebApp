// controllers/customerController.js
const fs = require('fs');
const path = require('path');
const { logActivity, logError } = require('../middleware/logger');

const usersPath = path.join(__dirname, '../data/users.json');
const getUsers = () => (fs.existsSync(usersPath)
  ? JSON.parse(fs.readFileSync(usersPath, 'utf-8') || '[]')
  : []);

exports.showCustomerLogin = (req, res) => {
  res.render('customer_login', { error: null });
};

exports.customerLogin = (req, res) => {
  try {
    const { username, password } = req.body;
    const users = getUsers();

    const u = users.find(x =>
      x.lpa_user_username === username &&
      x.lpa_user_password === password &&
      x.lpa_user_status !== 'D'
    );

    if (!u) {
      logActivity(`Customer login FAIL: ${username}`);
      return res.status(401).render('customer_login', { error: 'Invalid credentials' });
    }

    req.session.customer = {
      id: u.lpa_user_ID,
      username: u.lpa_user_username,
      firstname: u.lpa_user_firstname,
      lastname: u.lpa_user_lastname,
      address: u.lpa_user_address,
      phone: u.lpa_user_phonenumber
    };

    logActivity(`Customer login OK: ${username}`);
    return res.redirect('/checkout');
  } catch (e) {
    logError(`Customer login error: ${e.message}`);
    return res.status(500).render('customer_login', { error: 'Server error' });
  }
};

exports.customerLogout = (req, res) => {
  const who = req.session?.customer?.username || 'unknown';
  req.session.customer = null;
  logActivity(`Customer logout: ${who}`);
  res.redirect('/shirts');
};

