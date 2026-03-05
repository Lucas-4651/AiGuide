const { Challenge } = require('../models');

exports.complete = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Non connecté' });
    const ch = await Challenge.today();
    if (!ch) return res.json({ ok: false, msg: 'Aucun défi aujourd\'hui' });
    const done = await Challenge.complete(req.user.id, ch.id);
    res.json({ ok: true, alreadyDone: !done, streak: req.user.streak || 0 });
  } catch (e) { next(e); }
};
