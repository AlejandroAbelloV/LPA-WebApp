// routes/customer.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/login', customerController.showCustomerLogin);
router.post('/login', customerController.customerLogin);
router.get('/logout', customerController.customerLogout);

module.exports = router;
