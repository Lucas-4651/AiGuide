// ============================================================
//  src/routes/auth.js
// ============================================================
const express  = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const router   = express.Router();
const ctrl     = require('../controllers/authController');
const { isGuest } = require('../middlewares/auth');

router.get('/login',    isGuest, ctrl.showLogin);
router.post('/login',   isGuest, ctrl.login);

router.get('/register', isGuest, ctrl.showRegister);
router.post('/register', isGuest,
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe : minimum 6 caracteres'),
  body('username').trim().notEmpty().withMessage('Pseudo requis'),
  ctrl.register
);

router.get('/logout', ctrl.logout);

// OAuth Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login', failureFlash: true }),
  ctrl.googleCallback
);

// OAuth GitHub
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/login', failureFlash: true }),
  ctrl.githubCallback
);

module.exports = router;


