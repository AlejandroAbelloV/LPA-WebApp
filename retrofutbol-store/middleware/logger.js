// middleware/logger.js
const fs = require('fs');
const path = require('path');

// Rutas de log
const LOG_DIR = path.join(__dirname, '../log');
const LOG_FILE = path.join(LOG_DIR, 'lpalog.log');

// Asegurar carpeta/archivo
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '', 'utf8');

// --- Núcleo de escritura ---
function write(line) {
  const ts = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${ts}] ${line}\n`, 'utf8');
}

// Middleware que loguea cada request
function requestLogger(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  write(`Request: ${req.method} ${req.originalUrl} - IP: ${ip}`);
  next();
}

// API de logging (ambas variantes, para compatibilidad)
function log(message) {
  write(`LOG: ${message}`);
}
function logActivity(message) {
  write(`Activity: ${message}`);
}
function logError(message) {
  write(`Error: ${message}`);
}

module.exports = {
  requestLogger,
  log,
  logActivity,
  logError,
};
