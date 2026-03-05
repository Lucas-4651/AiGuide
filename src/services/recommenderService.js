// ============================================================
//  src/services/recommenderService.js
//  Algorithme de recommandation d'IAs selon la description
//  du projet de l'utilisateur (scoring simple + mots-cles)
// ============================================================
const { AI } = require('../models');

const TYPE_KEYWORDS = {
  text_generation : ['redac', 'ecri', 'texte', 'article', 'blog', 'email', 'lettre', 'contenu', 'chat', 'convers', 'resume', 'traduc', 'correc', 'roman', 'copywriting'],
  image_generation: ['image', 'photo', 'illustration', 'dessin', 'visuel', 'logo', 'art', 'design graphique', 'affiche', 'banniere', 'icon'],
  code            : ['code', 'programm', 'dev', 'script', 'bug', 'debug', 'api', 'web', 'app', 'fonction', 'javascript', 'python', 'react'],
  audio           : ['audio', 'son', 'musique', 'voix', 'podcast', 'tts', 'speech', 'parole'],
  video           : ['video', 'film', 'animation', 'clip', 'montage', 'reels'],
  data_analysis   : ['donnee', 'data', 'analyse', 'tableau', 'csv', 'stats', 'visuali', 'graphique', 'excel'],
  search          : ['recherche', 'search', 'info', 'actualite', 'web', 'internet', 'source']
};

const PRICING_KEYWORDS = {
  free       : ['gratuit', 'free', 'sans payer', 'budget 0', 'budget zero', 'sans budget'],
  freemium   : ['freemium', 'essai', 'trial', 'tester gratuitement'],
  open_source: ['open source', 'open-source', 'local', 'self-host', 'heberger moi-meme', 'prive']
};

const DIFFICULTY_KEYWORDS = {
  beginner    : ['debutant', 'facile', 'simple', 'novice', 'commencer', 'apprendre', 'decouvrir', 'premier', 'introduction'],
  intermediate: ['intermediaire', 'quelque experience', 'deja utilise'],
  advanced    : ['expert', 'avance', 'professionnel', 'entreprise', 'production', 'scalable']
};

function detectFilters(description) {
  const text    = description.toLowerCase();
  const filters = {};

  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some((k) => text.includes(k))) { filters.type = type; break; }
  }
  for (const [pricing, keywords] of Object.entries(PRICING_KEYWORDS)) {
    if (keywords.some((k) => text.includes(k))) { filters.pricing = pricing; break; }
  }
  for (const [diff, keywords] of Object.entries(DIFFICULTY_KEYWORDS)) {
    if (keywords.some((k) => text.includes(k))) { filters.difficulty = diff; break; }
  }

  return filters;
}

function scoreAI(ai, description, filters) {
  const text   = description.toLowerCase();
  let points   = 0;

  // Bonus filtres detectes
  if (filters.type       && ai.type            === filters.type)       points += 30;
  if (filters.pricing    && ai.pricing_type    === filters.pricing)    points += 20;
  if (filters.difficulty && ai.difficulty_level === filters.difficulty) points += 10;

  // Correspondance textuelle
  const aiText = [ai.name, ai.description, ...(ai.use_cases || []), ...(ai.tags || [])].join(' ').toLowerCase();
  const words  = text.split(/\s+/).filter((w) => w.length > 3);
  words.forEach((w) => { if (aiText.includes(w)) points += 3; });

  // Bonus vedette + popularite
  if (ai.is_featured) points += 5;
  points += Math.min(Number(ai.view_count) / 100, 10);

  return points;
}

async function recommend(description, manualFilters) {
  const autoFilters = detectFilters(description);
  const combined    = Object.assign({}, autoFilters, manualFilters || {});

  // Filtre d'abord avec les criteres detectes
  let ais = await AI.all(combined);
  // Si aucun resultat, on prend tout
  if (ais.length === 0) ais = await AI.all({});

  const scored = ais
    .map((ai) => ({ ai, score: scoreAI(ai, description, combined) }))
    .sort((a, b) => b.score - a.score);

  return {
    recommendations: scored.slice(0, 5).map((s) => s.ai),
    detectedType   : combined.type     || null,
    detectedPricing: combined.pricing  || null,
    detectedLevel  : combined.difficulty || null,
    total          : scored.length
  };
}

module.exports = { recommend, detectFilters };