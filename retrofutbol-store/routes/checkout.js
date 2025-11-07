// routes/checkout.js
const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

router.get('/', checkoutController.showCheckout);
router.post('/update', checkoutController.updateCheckout);
router.post('/remove/:key', checkoutController.removeItem);
router.post('/confirm', checkoutController.confirmCheckout);

module.exports = router;

