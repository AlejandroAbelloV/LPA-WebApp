// routes/index.js
var express = require('express');
var router = express.Router();

const path = require('path');
const fs = require('fs');

const { getShirts }   = require('../controllers/shirtController');
const authController  = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const shirtController = require('../controllers/shirtController');
const isAdmin         = require('../middleware/isAdmin'); // asegúrate que exista middleware/isAdmin.js

/* =========================
   HOME: renderiza productos
   ========================= */
router.get('/', function(req, res) {
  const shirts = getShirts();
  res.render('index', { title: 'Retro Futbol Store', shirts });
});

/* =========================
   LOGIN/LOGOUT ADMIN
   ========================= */
router.get('/login', authController.showLogin);
router.post('/login', authController.login);

// Logout admin (usa authController.logout que ya creaste)
router.get('/logout', authController.logout);

/* =========================
   REGISTRO DE CLIENTE (opcional)
   - Guarda en data/users.json con el esquema lpa_* que usa customerController
   ========================= */
router.get('/register', (req, res) => res.render('register', { error: null }));

router.post('/register', (req, res) => {
  const usersPath = path.join(__dirname, '../data/users.json');
  const { firstName, lastName, address, phone, username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render('register', { error: 'Passwords do not match' });
  }

  let users = [];
  if (fs.existsSync(usersPath)) {
    try {
      users = JSON.parse(fs.readFileSync(usersPath, 'utf-8') || '[]');
    } catch {
      users = [];
    }
  }

  // Validación por username en el mismo campo que usa customerController
  if (users.find(u => u.lpa_user_username === username && u.lpa_user_status !== 'D')) {
    return res.render('register', { error: 'Username already exists' });
  }

  // Generar ID simple
  const newId = 'U' + Date.now();

  users.push({
    lpa_user_ID: newId,
    lpa_user_username: username,
    lpa_user_password: password,
    lpa_user_firstname: firstName,
    lpa_user_lastname: lastName,
    lpa_user_address: address,
    lpa_user_phonenumber: phone,
    lpa_user_group: 'customer',
    lpa_user_status: 'A'
  });

  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  return res.redirect('/customer/login'); // tras registro, pásalo al login de cliente
});

/* =========================
   RUTAS ADMIN (protegidas)
   ========================= */
router.get('/admin',            isAdmin, shirtController.showAdminPanel);
router.get('/admin/add',        isAdmin, adminController.showAddForm);
router.post('/admin/add',       isAdmin, adminController.addShirt);
router.get('/admin/edit/:id',   isAdmin, adminController.showEditForm);
router.post('/admin/edit/:id',  isAdmin, adminController.updateShirt);
router.post('/admin/delete/:id',isAdmin, adminController.deleteShirt);

module.exports = router;
