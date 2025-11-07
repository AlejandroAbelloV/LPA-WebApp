// controllers/completeController.js
exports.showComplete = (req, res) => {
  const inv = req.session.lastInvoice || null;
  res.render('complete', { inv });
};
