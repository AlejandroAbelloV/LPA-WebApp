const path = require('path');
const fs = require('fs');

const getShirts = () => {
  const shirtsPath = path.join(__dirname, '../data/shirts.json');
  return JSON.parse(fs.readFileSync(shirtsPath, 'utf-8'));
};
exports.getShirts = getShirts;

// controllers/shirtController.js (solo esta función)
exports.listShirts = (req, res) => {
  const shirtsAll = getShirts();

  // Parámetros de filtro (GET)
  const { q = '', year = '', size = '', min = '', max = '', sort = '' } = req.query;

  // Trabajamos sobre una copia
  let shirts = shirtsAll.slice();

  // Búsqueda de texto (team, year, description)
  const qnorm = (q || '').trim().toLowerCase();
  if (qnorm) {
    shirts = shirts.filter(s =>
      [`${s.team}`, `${s.year}`, `${s.description || ''}`]
        .some(v => v.toLowerCase().includes(qnorm))
    );
  }

  // Año exacto
  if (year) {
    const yn = parseInt(year, 10);
    if (!isNaN(yn)) shirts = shirts.filter(s => s.year === yn);
  }

  // Talla con stock
  if (size) {
    shirts = shirts.filter(s =>
      Array.isArray(s.sizes) &&
      s.sizes.some(sz => sz.size === size && Number(sz.stock) > 0)
    );
  }

  // Precio mínimo / máximo
  const minN = parseFloat(min);
  if (!isNaN(minN)) shirts = shirts.filter(s => Number(s.price) >= minN);

  const maxN = parseFloat(max);
  if (!isNaN(maxN)) shirts = shirts.filter(s => Number(s.price) <= maxN);

  // Orden
  switch (sort) {
    case 'price_asc':  shirts.sort((a, b) => a.price - b.price); break;
    case 'price_desc': shirts.sort((a, b) => b.price - a.price); break;
    case 'year_asc':   shirts.sort((a, b) => a.year - b.year);   break;
    case 'year_desc':  shirts.sort((a, b) => b.year - a.year);   break;
    case 'name_asc':   shirts.sort((a, b) => a.team.localeCompare(b.team)); break;
  }

  // Opciones de selects (desde TODA la data)
  const years = Array.from(new Set(shirtsAll.map(s => s.year))).sort((a, b) => b - a);
  const sizesAvail = Array.from(new Set(
    shirtsAll.flatMap(s => (Array.isArray(s.sizes) ? s.sizes.map(x => x.size) : []))
  )).sort();

  res.render('shirts', {
    shirts,
    total: shirts.length,
    years,
    sizesAvail,
    filters: { q, year, size, min, max, sort }
  });
};


exports.showShirtDetail = (req, res) => {
  const shirtId = parseInt(req.params.id);
  const shirts = getShirts();
  const shirt = shirts.find(s => s.id === shirtId);
  if (!shirt) return res.status(404).send("Camiseta no encontrada");
  res.render('shirtDetail', { shirt });
};

exports.addToCart = (req, res) => {
  const shirtId = parseInt(req.params.id);
  const selectedSize = req.body.size;
  const qty = Math.max(1, parseInt(req.body.qty || '1', 10));

  const shirts = getShirts();
  const shirt = shirts.find(s => s.id === shirtId);
  if (!shirt) return res.status(404).send("Camiseta no encontrada");

  const selectedSizeData = (shirt.sizes || []).find(s => s.size === selectedSize);
  if (!selectedSizeData || selectedSizeData.stock === 0)
    return res.status(400).send("Talla no disponible o agotada");

  if (!req.session.cart) req.session.cart = [];

  // Si ya existe mismo producto + talla, acumula qty
  const key = `${shirt.id}-${selectedSize}`;
  const existing = req.session.cart.find(i => i.key === key);
  if (existing) {
    existing.qty += qty;
  } else {
    req.session.cart.push({
      key,
      code: String(shirt.id),      // mapea a Product Code
      name: `${shirt.team} ${shirt.year}`,
      price: shirt.price,
      selectedSize,
      qty,
      image: shirt.image
    });
  }
  res.redirect('/cart');
};

// dentro de controllers/shirtController.js
exports.addToCart = (req, res) => {
  const shirtId = parseInt(req.params.id);
  const selectedSize = req.body.size;
  const qtyReq = Math.max(1, parseInt(req.body.qty || '1', 10));

  const shirts = getShirts();
  const shirt = shirts.find(s => s.id === shirtId);
  if (!shirt) return res.status(404).send("Camiseta no encontrada");

  const selectedSizeData = (shirt.sizes || []).find(s => s.size === selectedSize);
  if (!selectedSizeData) return res.status(400).send("Talla no disponible");
  const stock = Number(selectedSizeData.stock) || 0;
  if (stock === 0) return res.status(400).send("Talla agotada");

  if (!req.session.cart) req.session.cart = [];

  const key = `${shirt.id}-${selectedSize}`;
  const existing = req.session.cart.find(i => i.key === key);
  const already = existing ? existing.qty : 0;

  // Limitar a stock disponible total
  const maxCanAdd = Math.max(0, stock - already);
  const finalQtyToAdd = Math.min(qtyReq, maxCanAdd);
  if (finalQtyToAdd <= 0) {
    // ya alcanzó el stock máximo en el carrito
    return res.redirect('/checkout'); // o /cart con un mensaje si implementas flash
  }

  if (existing) {
    existing.qty += finalQtyToAdd;
  } else {
    req.session.cart.push({
      key,
      code: String(shirt.id),
      name: `${shirt.team} ${shirt.year}`,
      price: shirt.price,
      selectedSize,
      qty: finalQtyToAdd,
      image: shirt.image
    });
  }

  res.redirect('/cart');
};



exports.showAdminPanel = (req, res) => {
  const shirts = getShirts();
  res.render('admin', { shirts: shirts });
};

