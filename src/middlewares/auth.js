// ============================================================
//  src/middlewares/auth.js
// ============================================================

// Utilisateur connecté (n'importe quel role)
const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'Connecte-toi pour acceder a cette page');
  res.redirect('/auth/login');
};

// Administrateur uniquement — redirige vers /admin/login si non autorisé
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  req.flash('error', req.isAuthenticated()
    ? 'Acces refuse — reserve aux administrateurs'
    : 'Connexion administrateur requise'
  );
  res.redirect('/admin/login');
};

// Visiteur non connecté (pour les pages login/register)
const isGuest = (req, res, next) => {
  if (req.isAuthenticated()) return res.redirect('/');
  next();
};

module.exports = { isAuth, isAdmin, isGuest };
