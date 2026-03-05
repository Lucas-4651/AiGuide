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

if (process.env.NODE_ENV !== 'production') {
  const SQLiteStore = require('connect-sqlite3')(session);
  const store = new SQLiteStore({ db: 'sessions.sqlite', dir: '.' });
  app.use(session({ secret: process.env.SESSION_SECRET || 'dev', resave: false, saveUninitialized: false, store, cookie: { maxAge: 604800000 } }));
} else {
  app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false, cookie: { secure: true, maxAge: 604800000 } }));
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
  res.locals.user = req.user || null;
  res.locals.isAdmin = req.user && req.user.role === 'admin';
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.info_msg = req.flash('info');
  res.locals.currentPath = req.path;
  next();
});
app.use(activityLogger);
app.use('/', require('./src/routes/public'));
app.use('/auth', require('./src/routes/auth'));
app.use('/generator', require('./src/routes/generator'));
app.use('/admin', require('./src/routes/admin'));
app.use((req, res) => res.status(404).render('pages/404', { title: '404' }));
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).render('pages/error', { title: 'Erreur', message: process.env.NODE_ENV === 'development' ? err.message : 'Erreur serveur' });
});
async function start() {
  try {
    await db.raw('SELECT 1');
    console.log("✅ DB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (e) {
    console.error("❌ Startup error:");
    console.error(e);
    process.exit(1);
  }
}
start();
module.exports = app;
