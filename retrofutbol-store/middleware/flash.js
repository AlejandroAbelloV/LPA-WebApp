// middleware/flash.js
function setToast(req, type, message) {
  // type: 'success' | 'info' | 'warning' | 'danger'
  req.session.__toast = { type, message };
}

function consumeToast(req, res, next) {
  res.locals.toast = req.session.__toast || null;
  if (req.session.__toast) delete req.session.__toast;
  next();
}

module.exports = { setToast, consumeToast };
