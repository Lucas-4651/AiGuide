// ============================================================
//  src/controllers/authController.js
// ============================================================
const passport   = require('passport');
const bcrypt     = require('bcryptjs');
const { validationResult } = require('express-validator');
const { User, Log } = require('../models');

exports.showLogin = (req, res) => {
  res.render('pages/login', { title: 'Connexion', layout: 'layouts/auth' });
};

exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash('error', info ? info.message : 'Erreur de connexion');
      return res.redirect('/auth/login');
    }
    req.logIn(user, async (err) => {
      if (err) return next(err);
      try {
        await Log.create({ user_id: user.id, action: 'LOGIN', ip_address: req.ip, created_at: new Date().toISOString() });
      } catch (e) {}
      req.flash('success', 'Bienvenue ' + user.username + ' !');
      res.redirect(user.role === 'admin' ? '/admin' : '/');
    });
  })(req, res, next);
};

exports.showRegister = (req, res) => {
  res.render('pages/register', { title: 'Inscription', layout: 'layouts/auth' });
};

exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/auth/register');
  }
  try {
    const { email, username, password } = req.body;
    const exists = await User.findByEmail(email);
    if (exists) {
      req.flash('error', 'Cet email est deja utilise');
      return res.redirect('/auth/register');
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email        : email.toLowerCase(),
      username,
      password_hash: hash,
      role         : 'user',
      is_active    : true,
      created_at   : new Date().toISOString()
    });
    req.flash('success', 'Compte cree avec succes ! Connecte-toi.');
    res.redirect('/auth/login');
  } catch (e) {
    next(e);
  }
};

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'Deconnecte avec succes');
    res.redirect('/');
  });
};

exports.googleCallback = (req, res) => {
  req.flash('success', 'Connecte via Google !');
  res.redirect(req.user && req.user.role === 'admin' ? '/admin' : '/');
};

exports.githubCallback = (req, res) => {
  req.flash('success', 'Connecte via GitHub !');
  res.redirect(req.user && req.user.role === 'admin' ? '/admin' : '/');
};


