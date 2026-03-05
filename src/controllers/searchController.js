const db = require('../config/database');

exports.search = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) return res.json({ results: [] });

    const like = '%' + q + '%';
    const [ais, tips, cards, roadmaps] = await Promise.all([
      db('ai_tools').where({ is_active: true })
        .where(function() { this.whereLike('name', like).orWhereLike('description', like) })
        .select('id', 'name', 'slug', 'short_description', 'type').limit(5),
      db('tips').where({ is_active: true })
        .where(function() { this.whereLike('title', like).orWhereLike('content', like) })
        .select('id', 'title', 'category').limit(4),
      db('flash_cards').where({ is_active: true })
        .where(function() { this.whereLike('term', like).orWhereLike('definition', like) })
        .select('id', 'term', 'category').limit(4),
      db('roadmaps').where({ is_active: true })
        .whereLike('title', like)
        .select('id', 'title', 'level').limit(3),
    ]);

    const results = [
      ...ais.map(a      => ({ type: 'ia',       label: a.name,  sub: a.short_description || a.type, url: '/explore/' + a.slug })),
      ...tips.map(t     => ({ type: 'astuce',   label: t.title, sub: t.category,                    url: '/tips' })),
      ...cards.map(c    => ({ type: 'flashcard',label: c.term,  sub: c.category,                    url: '/flashcards' })),
      ...roadmaps.map(r => ({ type: 'roadmap',  label: r.title, sub: r.level,                       url: '/roadmap/' + r.id })),
    ];

    res.json({ results, q });
  } catch (e) { next(e); }
};
