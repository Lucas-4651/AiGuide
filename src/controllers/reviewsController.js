const { Review, Badge } = require('../models');

exports.post = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error:'Non connecté' });
    const aiId = parseInt(req.params.aiId);
    const rating = parseInt(req.body.rating);
    const comment = (req.body.comment || '').trim().slice(0,500);
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error:'Note invalide' });
    const ex = await Review.byUser(req.user.id, aiId);
    if (ex) { await Review.update(req.user.id, aiId, { rating, comment }); }
    else    { await Review.create({ user_id: req.user.id, ai_id: aiId, rating, comment }); }
    await Badge.award(req.user.id, 'first_review');
    const [avg, count] = await Promise.all([Review.avgRating(aiId), Review.count(aiId)]);
    res.json({ ok:true, avg, count });
  } catch(e){ next(e); }
};

exports.delete = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error:'Non connecté' });
    await Review.delete(req.user.id, req.params.aiId);
    res.json({ ok:true });
  } catch(e){ next(e); }
};
