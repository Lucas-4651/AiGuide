const { AI } = require('../models');

exports.show = (req, res) => {
  res.render('pages/advisor', { layout:'layouts/main', title:'IA Advisor', result: null });
};

exports.recommend = async (req, res, next) => {
  try {
    const { goal, level, budget, usage, team } = req.body;
    let filters = {};
    if (level)  filters.difficulty = level;
    if (budget === 'gratuit') filters.pricing = 'free';
    if (budget === 'freemium') filters.pricing = 'freemium';

    let ais = await AI.all(filters);

    // Scoring
    const keywords = (goal || '').toLowerCase().split(/\s+/);
    const usageMap = {
      'code':['code','programming','developer'],
      'image':['image','design','creative','photo'],
      'texte':['text','writing','content','rédaction'],
      'data':['data','analysis','research','analytics'],
      'audio':['audio','music','voice','speech'],
    };

    ais = ais.map(ai => {
      let score = 0;
      const haystack = (ai.name + ' ' + ai.description + ' ' + (ai.use_cases||[]).join(' ')).toLowerCase();
      keywords.forEach(kw => { if (haystack.includes(kw)) score += 2; });
      if (usage && usageMap[usage]) usageMap[usage].forEach(kw => { if (haystack.includes(kw)) score += 3; });
      if (ai.is_featured) score += 1;
      return { ...ai, _score: score };
    }).sort((a,b) => b._score - a._score);

    const result = ais.slice(0, 6);

    res.render('pages/advisor', {
      layout:'layouts/main', title:'IA Advisor — Résultats',
      result, goal, level, budget, usage
    });
  } catch(e){ next(e); }
};
