const passport = require('passport');
const { User, AI, Prompt, FlashCard, Roadmap, Tip, Log, Setting } = require('../models');

// ─── AUTH ADMIN ───────────────────────────────────────────────
exports.showAdminLogin = (req, res) => {
  if (req.isAuthenticated() && req.user.role === 'admin') return res.redirect('/admin');
  res.render('admin/login', {
    layout: false,
    title: 'Admin Login',
    error_msg: req.flash('error'),
    success_msg: req.flash('success')
  });
};

exports.adminLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) { req.flash('error', info ? info.message : 'Identifiants incorrects'); return res.redirect('/admin/login'); }
    if (user.role !== 'admin') { req.flash('error', 'Accès refusé — compte non administrateur'); return res.redirect('/admin/login'); }
    if (!user.is_active) { req.flash('error', 'Compte désactivé'); return res.redirect('/admin/login'); }
    req.logIn(user, async (err) => {
      if (err) return next(err);
      await Log.create({ user_id: user.id, action: 'ADMIN_LOGIN', ip_address: req.ip, created_at: new Date().toISOString() }).catch(() => {});
      res.redirect('/admin');
    });
  })(req, res, next);
};

exports.adminLogout = (req, res, next) => {
  req.logout((err) => { if (err) return next(err); res.redirect('/admin/login'); });
};

// ─── DASHBOARD ────────────────────────────────────────────────
exports.dashboard = async (req, res, next) => {
  try {
    const [userCount, aiCount, promptCount, logCount, recentLogs, recentPrompts, logStats] = await Promise.all([
      User.count(), AI.count(), Prompt.count(), Log.count(),
      Log.recent(10), Prompt.recent(5), Log.stats()
    ]);
    res.render('admin/dashboard', {
      layout: 'layouts/admin', title: 'Dashboard',
      stats: { users: userCount, ais: aiCount, prompts: promptCount, logs: logCount },
      recentLogs, recentPrompts, logStats
    });
  } catch (e) { next(e); }
};

// ─── IAs ──────────────────────────────────────────────────────
exports.listAIs = async (req, res, next) => {
  try {
    const ais = await AI.adminAll();
    res.render('admin/ais/index', { layout: 'layouts/admin', title: 'Gestion IAs', ais });
  } catch (e) { next(e); }
};

exports.newAIForm = (req, res) => {
  res.render('admin/ais/form', { layout: 'layouts/admin', title: 'Ajouter une IA', ai: null, action: '/admin/ais', method: 'POST' });
};

exports.createAI = async (req, res, next) => {
  try {
    const data = sanitizeAI(req.body);
    await AI.create(data);
    req.flash('success', 'IA "' + data.name + '" ajoutée');
    res.redirect('/admin/ais');
  } catch (e) { req.flash('error', 'Erreur: ' + e.message); res.redirect('/admin/ais/new'); }
};

exports.editAIForm = async (req, res, next) => {
  try {
    const ai = await AI.byId(req.params.id);
    if (!ai) { req.flash('error', 'IA introuvable'); return res.redirect('/admin/ais'); }
    res.render('admin/ais/form', { layout: 'layouts/admin', title: 'Modifier ' + ai.name, ai, action: '/admin/ais/' + ai.id + '?_method=PUT', method: 'POST' });
  } catch (e) { next(e); }
};

exports.updateAI = async (req, res, next) => {
  try {
    await AI.update(req.params.id, sanitizeAI(req.body));
    req.flash('success', 'IA mise à jour');
    res.redirect('/admin/ais');
  } catch (e) { next(e); }
};

exports.deleteAI = async (req, res, next) => {
  try {
    await AI.delete(req.params.id);
    req.flash('success', 'IA supprimée');
    res.redirect('/admin/ais');
  } catch (e) { next(e); }
};

function sanitizeAI(body) {
  const toJSON = (val) => {
    if (!val) return JSON.stringify([]);
    return JSON.stringify(val.split('\n').map((s) => s.trim()).filter(Boolean));
  };
  return {
    name: body.name,
    slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    description: body.description,
    short_description: body.short_description || '',
    type: body.type,
    provider: body.provider || '',
    website_url: body.website_url || '',
    pricing_type: body.pricing_type || 'free',
    price_info: body.price_info || '',
    strengths: toJSON(body.strengths),
    limitations: toJSON(body.limitations),
    use_cases: toJSON(body.use_cases),
    tags: toJSON(body.tags),
    logo_url: body.logo_url || '',
    difficulty_level: body.difficulty_level || 'beginner',
    is_featured: body.is_featured ? 1 : 0,
    is_active: body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// ─── UTILISATEURS ─────────────────────────────────────────────
exports.listUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const users = await User.all(page, 20);
    const total = await User.count();
    res.render('admin/users/index', {
      layout: 'layouts/admin', title: 'Utilisateurs',
      users, total, page, pages: Math.ceil(total / 20)
    });
  } catch (e) { next(e); }
};

exports.viewUser = async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) { req.flash('error', 'Utilisateur introuvable'); return res.redirect('/admin/users'); }
    const prompts = await Prompt.forUser(u.id, 20);
    const logs    = await Log.forUser(u.id);
    res.render('admin/users/detail', {
      layout: 'layouts/admin', title: 'Utilisateur : ' + u.username,
      u, prompts, logs
    });
  } catch (e) { next(e); }
};

exports.toggleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { req.flash('error', 'Introuvable'); return res.redirect('/admin/users'); }
    if (user.id === req.user.id) { req.flash('error', 'Tu ne peux pas te désactiver toi-même'); return res.redirect('/admin/users'); }
    await User.update(user.id, { is_active: user.is_active ? 0 : 1 });
    req.flash('success', 'Statut mis à jour');
    res.redirect('/admin/users');
  } catch (e) { next(e); }
};

exports.changeRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.id === req.user.id) { req.flash('error', 'Action impossible'); return res.redirect('/admin/users'); }
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    await User.update(user.id, { role: newRole });
    req.flash('success', 'Rôle mis à jour : ' + newRole);
    res.redirect('/admin/users');
  } catch (e) { next(e); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.id === req.user.id) { req.flash('error', 'Action impossible'); return res.redirect('/admin/users'); }
    await User.delete(req.params.id);
    req.flash('success', 'Utilisateur supprimé');
    res.redirect('/admin/users');
  } catch (e) { next(e); }
};

// ─── PROMPTS ──────────────────────────────────────────────────
exports.listPrompts = async (req, res, next) => {
  try {
    const prompts = await Prompt.recent(50);
    res.render('admin/prompts/index', { layout: 'layouts/admin', title: 'Tous les Prompts', prompts });
  } catch (e) { next(e); }
};

exports.deletePrompt = async (req, res, next) => {
  try {
    await Prompt.delete(req.params.id);
    req.flash('success', 'Prompt supprimé');
    res.redirect('/admin/prompts');
  } catch (e) { next(e); }
};

// ─── FLASH CARDS ──────────────────────────────────────────────
exports.listFlashCards = async (req, res, next) => {
  try {
    const cards = await FlashCard.adminAll();
    res.render('admin/content/flashcards', { layout: 'layouts/admin', title: 'Flash Cards', cards });
  } catch (e) { next(e); }
};

exports.createFlashCard = async (req, res, next) => {
  try {
    await FlashCard.create({ ...req.body, is_active: 1, created_at: new Date().toISOString() });
    req.flash('success', 'Flash card ajoutée');
    res.redirect('/admin/content/flashcards');
  } catch (e) { next(e); }
};

exports.editFlashCardForm = async (req, res, next) => {
  try {
    const card = await FlashCard.adminAll().then(cards => cards.find(c => c.id == req.params.id));
    if (!card) { req.flash('error', 'Carte introuvable'); return res.redirect('/admin/content/flashcards'); }
    res.render('admin/content/flashcard-edit', { layout: 'layouts/admin', title: 'Modifier la carte', card });
  } catch (e) { next(e); }
};

exports.updateFlashCard = async (req, res, next) => {
  try {
    await FlashCard.update(req.params.id, req.body);
    req.flash('success', 'Flash card mise à jour');
    res.redirect('/admin/content/flashcards');
  } catch (e) { next(e); }
};

exports.deleteFlashCard = async (req, res, next) => {
  try {
    await FlashCard.delete(req.params.id);
    req.flash('success', 'Flash card supprimée');
    res.redirect('/admin/content/flashcards');
  } catch (e) { next(e); }
};

// ─── TIPS ─────────────────────────────────────────────────────
exports.listTips = async (req, res, next) => {
  try {
    const tips = await Tip.adminAll();
    res.render('admin/content/tips', { layout: 'layouts/admin', title: 'Astuces', tips });
  } catch (e) { next(e); }
};

exports.createTip = async (req, res, next) => {
  try {
    await Tip.create({ ...req.body, is_active: 1, created_at: new Date().toISOString() });
    req.flash('success', 'Astuce ajoutée');
    res.redirect('/admin/content/tips');
  } catch (e) { next(e); }
};

exports.editTipForm = async (req, res, next) => {
  try {
    const tips = await Tip.adminAll();
    const tip = tips.find(t => t.id == req.params.id);
    if (!tip) { req.flash('error', 'Astuce introuvable'); return res.redirect('/admin/content/tips'); }
    res.render('admin/content/tip-edit', { layout: 'layouts/admin', title: 'Modifier l\'astuce', tip });
  } catch (e) { next(e); }
};

exports.updateTip = async (req, res, next) => {
  try {
    await Tip.update(req.params.id, req.body);
    req.flash('success', 'Astuce mise à jour');
    res.redirect('/admin/content/tips');
  } catch (e) { next(e); }
};

exports.deleteTip = async (req, res, next) => {
  try {
    await Tip.delete(req.params.id);
    req.flash('success', 'Astuce supprimée');
    res.redirect('/admin/content/tips');
  } catch (e) { next(e); }
};

// ─── ROADMAPS ─────────────────────────────────────────────────
exports.listRoadmaps = async (req, res, next) => {
  try {
    const roadmaps = await Roadmap.adminAll();
    res.render('admin/roadmaps/index', { layout: 'layouts/admin', title: 'Roadmaps', roadmaps });
  } catch (e) { next(e); }
};

exports.newRoadmapForm = (req, res) => {
  res.render('admin/roadmaps/form', { layout: 'layouts/admin', title: 'Ajouter une Roadmap', roadmap: null, action: '/admin/roadmaps', method: 'POST' });
};

exports.createRoadmap = async (req, res, next) => {
  try {
    const steps = (req.body.steps || '').split('\n').map(s => s.trim()).filter(Boolean).map(s => ({ title: s, description: '', resource: '' }));
    await Roadmap.create({
      title: req.body.title,
      description: req.body.description,
      level: req.body.level,
      target_audience: req.body.target_audience || '',
      estimated_duration: req.body.estimated_duration || '',
      steps: JSON.stringify(steps),
      is_active: 1,
      created_at: new Date().toISOString()
    });
    req.flash('success', 'Roadmap créée');
    res.redirect('/admin/roadmaps');
  } catch (e) { next(e); }
};

exports.editRoadmapForm = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.byId(req.params.id);
    if (!roadmap) { req.flash('error', 'Roadmap introuvable'); return res.redirect('/admin/roadmaps'); }
    res.render('admin/roadmaps/form', { layout: 'layouts/admin', title: 'Modifier ' + roadmap.title, roadmap, action: '/admin/roadmaps/' + roadmap.id + '?_method=PUT', method: 'POST' });
  } catch (e) { next(e); }
};

exports.updateRoadmap = async (req, res, next) => {
  try {
    const steps = (req.body.steps || '').split('\n').map(s => s.trim()).filter(Boolean).map(s => ({ title: s, description: '', resource: '' }));
    await Roadmap.update(req.params.id, {
      title: req.body.title,
      description: req.body.description,
      level: req.body.level,
      target_audience: req.body.target_audience || '',
      estimated_duration: req.body.estimated_duration || '',
      steps: JSON.stringify(steps),
      updated_at: new Date().toISOString()
    });
    req.flash('success', 'Roadmap mise à jour');
    res.redirect('/admin/roadmaps');
  } catch (e) { next(e); }
};

exports.deleteRoadmap = async (req, res, next) => {
  try {
    await Roadmap.delete(req.params.id);
    req.flash('success', 'Roadmap supprimée');
    res.redirect('/admin/roadmaps');
  } catch (e) { next(e); }
};

// ─── LOGS ─────────────────────────────────────────────────────
exports.logs = async (req, res, next) => {
  try {
    const [logs, stats] = await Promise.all([Log.recent(100), Log.stats()]);
    res.render('admin/logs/index', { layout: 'layouts/admin', title: 'Logs & Métriques', logs, stats });
  } catch (e) { next(e); }
};

// ─── SETTINGS ─────────────────────────────────────────────────
exports.settings = async (req, res, next) => {
  try {
    const settings = await Setting.all();
    res.render('admin/settings', { layout: 'layouts/admin', title: 'Paramètres', settings });
  } catch (e) { next(e); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    for (const [key, value] of Object.entries(req.body)) await Setting.set(key, value);
    req.flash('success', 'Paramètres sauvegardés');
    res.redirect('/admin/settings');
  } catch (e) { next(e); }
};

// ─── PROMPTS model patch ──────────────────────────────────────
// (au cas où Prompt.delete n'existe pas)
Prompt.delete = Prompt.delete || ((id) => require('../config/database')('prompts').where({ id }).delete());
