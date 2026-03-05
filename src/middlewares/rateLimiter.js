// ============================================================
//  src/middlewares/rateLimiter.js
// ============================================================
const rateLimit = require('express-rate-limit');

// Limite generale API (anti-spam)
const apiLimiter = rateLimit({
  windowMs       : 15 * 60 * 1000,  // 15 minutes
  max            : 100,
  standardHeaders: true,
  legacyHeaders  : false,
  message        : { error: 'Trop de requetes. Reessaie dans 15 min.' }
});

// Limite pour le generateur (visiteurs non connectes)
const promptLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 heure
  max     : 10,
  skip    : (req) => req.isAuthenticated(),
  message : { error: 'Limite atteinte. Cree un compte pour continuer.' }
});

module.exports = { apiLimiter, promptLimiter };


