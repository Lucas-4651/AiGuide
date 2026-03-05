// ============================================================
//  src/middlewares/activityLogger.js
//  Winston pour les logs console/fichier + log DB
// ============================================================
const winston = require('winston');
const path    = require('path');
const fs      = require('fs');

// Cree le dossier logs s'il n'existe pas
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logger = winston.createLogger({
  level : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) =>
      '[' + timestamp + '] ' + level.toUpperCase() + ': ' + message
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(logsDir, 'app.log'),
      maxsize : 5 * 1024 * 1024,  // 5 MB
      maxFiles: 5
    })
  ]
});

// Middleware Express : logue chaque requete dans la DB
const activityLogger = async (req, res, next) => {
  const skipPrefixes = ['/css', '/js', '/images', '/favicon'];
  if (skipPrefixes.some((p) => req.path.startsWith(p))) return next();

  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  try {
    // Import ici pour eviter la dependance circulaire au demarrage
    const db = require('../config/database');
    await db('activity_logs').insert({
      user_id   : req.user ? req.user.id : null,
      action    : req.method + ' ' + req.path,
      ip_address: ip,
      user_agent: req.headers['user-agent'] ? req.headers['user-agent'].slice(0, 200) : null,
      created_at: new Date().toISOString()
    });
  } catch (e) {
    // Silencieux — ne pas bloquer la requete si le log echoue
  }
  next();
};

module.exports = { logger, activityLogger };