const { Collection, Prompt, Badge } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const cols = await Collection.forUser(req.user.id);
    res.render('pages/collections', { layout:'layouts/main', title:'Mes Collections', cols });
  } catch(e){ next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description, is_public } = req.body;
    if (!name) { req.flash('error','Nom requis'); return res.redirect('/collections'); }
    await Collection.create({ user_id: req.user.id, name, description:'', is_public: is_public?1:0 });
    await Badge.award(req.user.id, 'first_collection');
    req.flash('success', 'Collection "' + name + '" créée');
    res.redirect('/collections');
  } catch(e){ next(e); }
};

exports.detail = async (req, res, next) => {
  try {
    const col = await Collection.byId(req.params.id);
    if (!col) { req.flash('error','Introuvable'); return res.redirect('/collections'); }
    if (!col.is_public && col.user_id !== req.user.id) return res.redirect('/');
    const prompts = await Collection.prompts(col.id);
    const myCollections = req.user ? await Collection.forUser(req.user.id) : [];
    res.render('pages/collection-detail', { layout:'layouts/main', title: col.name, col, prompts, myCollections });
  } catch(e){ next(e); }
};

exports.delete = async (req, res, next) => {
  try {
    const col = await Collection.byId(req.params.id);
    if (col && col.user_id === req.user.id) await Collection.delete(req.params.id);
    req.flash('success','Collection supprimée');
    res.redirect('/collections');
  } catch(e){ next(e); }
};

exports.addPrompt = async (req, res, next) => {
  try {
    const { collection_id, prompt_id } = req.body;
    const col = await Collection.byId(collection_id);
    if (!col || col.user_id !== req.user.id) return res.status(403).json({ error:'Accès refusé' });
    await Collection.addPrompt(collection_id, prompt_id);
    res.json({ ok: true });
  } catch(e){ next(e); }
};

exports.removePrompt = async (req, res, next) => {
  try {
    await Collection.removePrompt(req.params.cid, req.params.pid);
    req.flash('success','Prompt retiré');
    res.redirect('/collections/' + req.params.cid);
  } catch(e){ next(e); }
};
