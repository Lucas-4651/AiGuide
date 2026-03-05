require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const db = require('./src/config/database');
require('./src/config/passport')(passport);
const { logger, activityLogger } = require('./src/middlewares/activityLogger');
const app = express();
const PORT = process.env.PORT || 3000;

// ── SESSION ────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  // Store PostgreSQL — évite le MemoryStore (leak mémoire en prod)
  const pgSession = require('connect-pg-simple')(session);
  app.use(session({
    store: new pgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'user_sessions',
      createTableIfMissing: true,   // crée la table auto au 1er démarrage
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, httpOnly: true, maxAge: 604800000 }
  }));
} else {
  const SQLiteStore = require('connect-sqlite3')(session);
  const store = new SQLiteStore({ db: 'sessions.sqlite', dir: '.' });
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev',
    resave: false,
    saveUninitialized: false,
    store,
    cookie: { maxAge: 604800000 }
  }));
}

app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.user       = req.user || null;
  res.locals.isAdmin    = req.user && req.user.role === 'admin';
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg  = req.flash('error');
  res.locals.info_msg   = req.flash('info');
  res.locals.currentPath = req.path;
  next();
});
app.use(activityLogger);
app.use('/',         require('./src/routes/public'));
app.use('/auth',     require('./src/routes/auth'));
app.use('/generator',require('./src/routes/generator'));
app.use('/admin', require('./src/routes/admin'));

// ── GESTION D'ERREURS DÉTAILLÉE ─────────────────────────────
// Capturer les exceptions non gérées
process.on('uncaughtException', (err) => {
  console.error('\n🔴 UNCAUGHT EXCEPTION:');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  if (logger) logger.error('UNCAUGHT EXCEPTION: ' + err.message + '\n' + err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n🔴 UNHANDLED REJECTION:');
  console.error('Reason:', reason);
  if (reason && reason.stack) {
    console.error('Stack:', reason.stack);
    if (logger) logger.error('UNHANDLED REJECTION: ' + reason.message + '\n' + reason.stack);
  } else {
    if (logger) logger.error('UNHANDLED REJECTION: ' + JSON.stringify(reason));
  }
});

// Middleware de gestion d'erreurs Express (doit être APRÈS toutes les routes)
app.use((err, req, res, next) => {
  console.error('\n🔴 EXPRESS ERROR:');
  console.error('URL:', req.url);
  console.error('Méthode:', req.method);
  console.error('Erreur:', err);
  console.error('Stack:', err.stack);
  
  if (logger) logger.error('Express error on ' + req.url + ': ' + err.message);
  
  res.status(500).render('pages/error', {
    title: 'Erreur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// 404 - Doit être APRÈS toutes les routes et AVANT le gestionnaire d'erreurs
app.use((req, res) => {
  res.status(404).render('pages/404', { title: '404' });
});

async function start() {
  try {
    await db.raw('SELECT 1');
    logger.info('✅ DB connectée');
    app.listen(PORT, () => logger.info('🚀 Serveur sur http://localhost:' + PORT));
  } catch (e) {
    console.error('❌ DB connection failed:', e.message);
    if (logger) logger.error('❌ DB connection failed: ' + e.message);
    process.exit(1);
  }
}
start();

module.exports = app;