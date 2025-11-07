var express = require('express');
var router = express.Router();
var cartController = require('../controllers/cartController');

// GET cart page
router.get('/', cartController.showCart);

router.post('/update', (req, res) => {
  const items = req.body.items || [];
  if (!req.session.cart) req.session.cart = [];
  // sincroniza qty
  req.session.cart = req.session.cart.map(it => {
    const hit = items.find(x => parseInt(x.id) === it.id);
    return hit ? { ...it, qty: Math.max(1, parseInt(hit.qty) || 1) } : it;
  });
  res.redirect('/cart');
});
router.post('/remove/:id', (req, res) => {
  const id = parseInt(req.params.id);
  req.session.cart = (req.session.cart || []).filter(it => it.id !== id);
  res.redirect('/cart');
});


module.exports = router;