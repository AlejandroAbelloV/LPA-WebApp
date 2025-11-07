exports.showCart = (req, res) => {
  // Preferir sesión si existe; si no, usar cookie 'cart'
  let cart = req.session.cart || [];
  if ((!cart || cart.length === 0) && req.cookies?.cart) {
    try { cart = JSON.parse(req.cookies.cart); } catch { cart = []; }
    // Normaliza para que la vista no rompa (usa las claves que espera)
    cart = cart.map(it => ({
      team: it.team || '',
      year: it.year || '',
      price: it.price || 0,
      selectedSize: it.size || '',
      qty: it.qty || 1
    }));
  }
  res.render('cart', { cart });
};
