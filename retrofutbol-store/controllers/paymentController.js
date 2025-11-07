// controllers/paymentController.js
const fs = require('fs');
const path = require('path');
const { logActivity } = require('../middleware/logger');

const invoicesPath = path.join(__dirname, '../data/invoices.json');
const invoiceItemsPath = path.join(__dirname, '../data/invoice_items.json');
const shirtsPath = path.join(__dirname, '../data/shirts.json');

function readJsonSafe(p) {
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf-8') || '[]');
}
function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}
function makeInvNo() {
  const n = Date.now();
  return 'INV' + n;
}

exports.showPayment = (req, res) => {
  if (!req.session.customer) return res.redirect('/customer/login');
  const c = req.session.customer;
  res.render('payment', { customer: c, error: null });
};

exports.processPayment = (req, res) => {
  if (!req.session.customer) return res.redirect('/customer/login');
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect('/checkout');

  const { firstname, lastname, address, phone, paymethod } = req.body;

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);
  const invNo = makeInvNo();

  // Guardar “factura” en JSON
  const invoices = readJsonSafe(invoicesPath);
  invoices.push({
    lpa_inv_no: invNo,
    lpa_inv_date: new Date().toISOString(),
    lpa_inv_client_ID: req.session.customer.id,
    lpa_inv_client_name: `${firstname} ${lastname}`,
    lpa_inv_client_address: address,
    lpa_inv_amount: subtotal,
    lpa_inv_status: 'P',
    lpa_inv_paymethod: paymethod
  });
  writeJson(invoicesPath, invoices);

  // Guardar items
  const items = readJsonSafe(invoiceItemsPath);
  cart.forEach((it, idx) => {
    items.push({
      lpa_invitem_no: `${invNo}-${idx+1}`,
      lpa_invitem_inv_no: invNo,
      lpa_invitem_stock_ID: it.code,
      lpa_invitem_stock_name: it.name,
      lpa_invitem_qty: String(it.qty),
      lpa_invitem_stock_price: it.price,
      lpa_invitem_stock_amount: it.price * it.qty,
      lpa_inv_status: 'P'
    });
  });
  writeJson(invoiceItemsPath, items);

  // === Descontar stock en shirts.json ===
  try {
    const shirts = JSON.parse(fs.readFileSync(shirtsPath, 'utf-8') || '[]');
    cart.forEach(it => {
      // it.code es el id en string
      const idNum = parseInt(it.code, 10);
      const shirt = shirts.find(s => s.id === idNum);
      if (!shirt || !Array.isArray(shirt.sizes)) return;
      const sizeRow = shirt.sizes.find(s => s.size === it.selectedSize);
      if (!sizeRow) return;
      // stock puede venir como string; normalizar
      const current = Number(sizeRow.stock) || 0;
      const newStock = Math.max(0, current - (Number(it.qty) || 0));
      sizeRow.stock = newStock;
    });
    fs.writeFileSync(shirtsPath, JSON.stringify(shirts, null, 2));
  } catch (e) {
    // no aborta el pago si falla el descuento, pero queda logueado
    console.error('Stock update error:', e.message);
  }

  logActivity(`Payment processed inv=${invNo} amount=${subtotal}`);

  // Guarda para pantalla de complete y limpia carrito
  req.session.lastInvoice = { invNo, amount: subtotal };
  req.session.cart = [];

  res.redirect('/complete');
};

