var express = require('express');
var router = express.Router();
var shirtController = require('../controllers/shirtController');

/* GET shirts listing page. */
router.get('/', shirtController.listShirts);

/* GET shirt detail page. */
router.get('/:id', shirtController.showShirtDetail);

/* POST add shirt to cart. */
router.post('/add-to-cart/:id', shirtController.addToCart);

module.exports = router;