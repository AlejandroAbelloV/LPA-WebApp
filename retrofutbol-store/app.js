var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var customerRouter = require('./routes/customer');
var checkoutRouter = require('./routes/checkout');
var paymentRouter = require('./routes/payment');
var completeRouter = require('./routes/complete');

const { requestLogger, logError } = require('./middleware/logger'); // NUEVO
const { consumeToast } = require('./middleware/flash'); // NUEVO


var logger = require('morgan');
const session = require('express-session');
//app.use(consumeToast); // NUEVO: pasa res.locals.toast a las vistas

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var shirtsRouter = require('./routes/shirts');
var cartRouter = require('./routes/cart');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // <-- ¡AQUÍ ESTÁ EL CAMBIO!
app.use(cookieParser());
app.use(session({
  secret: 'retrofutbol_store_secret_key',
  resave: false,
  saveUninitialized: true
}));

// HAZ VISIBLE req.session EN TODAS LAS VISTAS EJS
app.use((req, res, next) => {
  res.locals.session = req.session || {};
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(requestLogger); // NUEVO: log de cada request a log/lpalog.log


//const { requestLogger } = require('./middleware/logger');
//app.use(requestLogger);

// // app.js  (AGREGAR estas 2 líneas después de app.use(express.static(...)))
// const { requestBinder, requestLogger } = require('./middleware/logger');
// app.use(requestBinder);
// app.use(requestLogger);

// app.js  (AGREGAR antes de app.use('/', indexRouter);)
app.use((req, res, next) => {
  res.locals.customer = req.session.customer || null;
  next();
});


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/shirts', shirtsRouter);
app.use('/cart', cartRouter);
app.use('/customer', customerRouter);
app.use('/checkout', checkoutRouter);
app.use('/payment', paymentRouter);
app.use('/complete', completeRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  logError(err, req); // NUEVO: registra error en lpalog.log
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
