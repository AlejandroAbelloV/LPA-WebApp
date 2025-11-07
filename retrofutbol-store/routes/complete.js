// routes/complete.js
const express = require('express');
const router = express.Router();
const completeController = require('../controllers/completeController');

router.get('/', completeController.showComplete);

module.exports = router;
