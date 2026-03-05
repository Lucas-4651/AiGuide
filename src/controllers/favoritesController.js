const { Favorite } = require('../models');

exports.toggle = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Non connecté' });
    const added = await Favorite.toggle(req.user.id, req.params.aiId);
    res.json({ added });
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const favs = await Favorite.forUser(req.user.id);
    res.render('pages/favorites', {
      layout: 'layouts/main', title: 'Mes Favoris', favs
    });
  } catch (e) { next(e); }
};
