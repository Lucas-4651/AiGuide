const { User, Prompt, Favorite, Challenge, AI } = require('../models');
const db = require('../config/database');

// ─── MON PROFIL ────────────────────────────────────────────────
exports.myProfile = async (req, res, next) => {
  try {
    const [favs, prompts, isDone, challenge] = await Promise.all([
      Favorite.forUser(req.user.id),
      Prompt.forUser(req.user.id, 5),
      Challenge.isDoneToday(req.user.id),
      Challenge.today(),
    ]);
    const stats = {
      prompts: await db('prompts').where({ user_id: req.user.id }).count('id as c').first().then(r => Number(r.c)),
      favs: favs.length,
      streak: req.user.streak || 0,
    };
    res.render('pages/profile', {
      layout: 'layouts/main', title: 'Mon Profil',
      u: req.user, favs, prompts, stats, isDone, challenge
    });
  } catch (e) { next(e); }
};

// ─── PROFIL PUBLIC ─────────────────────────────────────────────
exports.publicProfile = async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u || !u.is_active) { req.flash('error', 'Profil introuvable'); return res.redirect('/'); }
    const [favs, prompts] = await Promise.all([
      Favorite.forUser(u.id),
      db('prompts').where({ user_id: u.id, is_public: true }).orderBy('created_at', 'desc').limit(10),
    ]);
    const stats = {
      prompts: await db('prompts').where({ user_id: u.id }).count('id as c').first().then(r => Number(r.c)),
      favs: favs.length,
      streak: u.streak || 0,
    };
    res.render('pages/profile-public', {
      layout: 'layouts/main', title: u.username + ' — Profil',
      u, favs, prompts, stats
    });
  } catch (e) { next(e); }
};

// ─── EDIT PROFIL ───────────────────────────────────────────────
exports.editProfile = async (req, res, next) => {
  try {
    const { bio, avatar_url } = req.body;
    await User.update(req.user.id, { bio: bio || '', avatar_url: avatar_url || '' });
    req.flash('success', 'Profil mis à jour');
    res.redirect('/profile');
  } catch (e) { next(e); }
};
