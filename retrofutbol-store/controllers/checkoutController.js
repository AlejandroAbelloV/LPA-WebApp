// controllers/checkoutController.js
const fs = require('fs');
const path = require('path');
const { logActivity } = require('../middleware/logger');

const shirtsPath = path.join(__dirname, '../data/shirts.json');
const getShirts = () => JSON.parse(fs.readFileSync(shirtsPath, 'utf-8') || '[]');

exports.showCheckout = (req, res) => {
  const cart = req.session.cart || [];
  const subtotal = cart.reduce((sum, it) => sum + it.price * it.qty, 0);
  res.render('checkout', { cart, subtotal });
};

exports.updateCheckout = (req, res) => {
  const cart = req.session.cart || [];
  const updates = req.body.qty || {}; // { key: qty }
  const shirts = getShirts();

  cart.forEach(item => {
    const newQty = parseInt(updates[item.key], 10);
    if (isNaN(newQty) || newQty < 1) return;

    // validar contra stock
    const idNum = parseInt(item.code, 10);
    const shirt = shirts.find(s => s.id === idNum);
    const sizeRow = shirt && Array.isArray(shirt.sizes)
      ? shirt.sizes.find(s => s.size === item.selectedSize)
      : null;
    const stock = sizeRow ? Number(sizeRow.stock) || 0 : 0;

    item.qty = Math.min(newQty, stock);
  });

  req.session.cart = cart.filter(i => i.qty > 0);
  logActivity('Checkout updated quantities (validated with stock)');
  res.redirect('/checkout');
};

exports.removeItem = (req, res) => {
  const key = req.params.key;
  req.session.cart = (req.session.cart || []).filter(i => i.key !== key);
  logActivity(`Checkout removed item ${key}`);
  res.redirect('/checkout');
};

exports.confirmCheckout = (req, res) => {
  // Debe estar logueado cliente para ir a payment (o redirigir)
  if (!req.session.customer) {
    return res.redirect('/customer/login');
  }
  res.redirect('/payment');
};

