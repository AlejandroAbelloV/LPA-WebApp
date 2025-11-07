// routes/payment.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/', paymentController.showPayment);
router.post('/', paymentController.processPayment);

module.exports = router;
