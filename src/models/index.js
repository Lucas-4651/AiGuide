// ============================================================
//  src/models/index.js
// ============================================================
const db = require('../config/database');

function parseJSON(val, fallback) {
  if (fallback === undefined) fallback = [];
  
  // Si null/undefined/chaîne vide, retourner fallback
  if (val === null || val === undefined || val === '') {
    return fallback;
  }
  
  // Si c'est déjà un tableau, le retourner directement
  if (Array.isArray(val)) {
    return val;
  }
  
  // Si c'est une chaîne, essayer de la parser
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }
  
  // Pour tout autre type, retourner fallback
  return fallback;
}


function hydrateAI(ai) {
  if (!ai) return null;
  return Object.assign({}, ai, {
    strengths  : parseJSON(ai.strengths),
    limitations: parseJSON(ai.limitations),
    use_cases  : parseJSON(ai.use_cases),
    tags       : parseJSON(ai.tags)
  });
}

// ─── USER ─────────────────────────────────────────────────────
// Dans src/models/index.js, remplacez la section USER par :
const User = {
  findById   : (id)    => db('users').where({ id }).first(),
  findByEmail: (email) => db('users').where({ email: email.toLowerCase() }).first(),
  
  create: async (data) => {
    // Renommer password en password_hash
    if (data.password) {
      data.password_hash = data.password;
      delete data.password;
    }
    return db('users').insert(data);
  },
  
  update: async (id, data) => {
    if (data.password) {
      data.password_hash = data.password;
      delete data.password;
    }
    return db('users').where({ id }).update(data);
  },
  
  delete     : (id)    => db('users').where({ id }).delete(),
  count      : ()      => db('users').count('id as c').first().then(r => Number(r.c)),
  all        : (page, limit) =>
    db('users').orderBy('created_at','desc')
      .limit(limit || 20).offset(((page||1)-1)*(limit||20)),

  checkPromptLimit: async (userId, maxLimit) => {
    const today = new Date().toISOString().slice(0,10);
    const user  = await db('users').where({ id: userId }).first();
    if (user.daily_prompt_date !== today) {
      await db('users').where({ id: userId }).update({ daily_prompt_count: 0, daily_prompt_date: today });
      return true;
    }
    return Number(user.daily_prompt_count) < Number(maxLimit);
  },

  incrementPromptCount: async (userId) => {
    const today = new Date().toISOString().slice(0,10);
    const user  = await db('users').where({ id: userId }).first();
    if (user.daily_prompt_date !== today)
      await db('users').where({ id: userId }).update({ daily_prompt_count: 1, daily_prompt_date: today });
    else
      await db('users').where({ id: userId }).increment('daily_prompt_count', 1);
  }
};

// ─── AI TOOL ──────────────────────────────────────────────────
const AI = {
  all: (filters) => {
    if (!filters) filters = {};
    let q = db('ai_tools').where({ is_active: true });
    if (filters.type)       q = q.where({ type: filters.type });
    if (filters.pricing)    q = q.where({ pricing_type: filters.pricing });
    if (filters.difficulty) q = q.where({ difficulty_level: filters.difficulty });
    if (filters.search) {
      const s = '%' + filters.search + '%';
      q = q.where(function() {
        this.whereLike('name', s).orWhereLike('description', s).orWhereLike('short_description', s);
      });
    }
    return q.orderBy('is_featured','desc').orderBy('view_count','desc')
      .then(rows => rows.map(hydrateAI));
  },
  featured : () => db('ai_tools').where({ is_active: true, is_featured: true }).then(rows => rows.map(hydrateAI)),
  trending : (limit) => db('ai_tools').where({ is_active: true }).orderBy('view_count','desc').limit(limit||8).then(rows => rows.map(hydrateAI)),
  bySlug   : async (slug) => hydrateAI(await db('ai_tools').where({ slug }).first()),
  byId     : async (id)   => hydrateAI(await db('ai_tools').where({ id }).first()),
  create   : (data)  => db('ai_tools').insert(data),
  update   : (id, data) => db('ai_tools').where({ id }).update(Object.assign({}, data, { updated_at: new Date().toISOString() })),
  delete   : (id)    => db('ai_tools').where({ id }).delete(),
  incView  : (id)    => db('ai_tools').where({ id }).increment('view_count', 1),
  types    : ()      => db('ai_tools').distinct('type').where({ is_active: true }).pluck('type'),
  count    : ()      => db('ai_tools').count('id as c').first().then(r => Number(r.c)),
  adminAll : ()      => db('ai_tools').orderBy('created_at','desc').then(rows => rows.map(hydrateAI)),
  recent   : (limit) => db('ai_tools').where({ is_active: true }).orderBy('created_at','desc').limit(limit||10).then(rows => rows.map(hydrateAI)),
};

// ─── PROMPT ───────────────────────────────────────────────────
const Prompt = {
  create   : (data)   => db('prompts').insert(data),
  findById : (id)     => db('prompts').where({ id }).first(),          // ← était manquant
  forUser  : (userId, limit) => db('prompts').where({ user_id: userId }).orderBy('created_at','desc').limit(limit||20),
  public   : (limit)  => db('prompts').where({ is_public: true }).orderBy('created_at','desc').limit(limit||20),
  rate     : (id, rating) => db('prompts').where({ id }).update({ rating }),
  delete   : (id)     => db('prompts').where({ id }).delete(),
  count    : ()       => db('prompts').count('id as c').first().then(r => Number(r.c)),
  recent   : (limit)  => db('prompts').orderBy('created_at','desc').limit(limit||10),

  guestCount: async (ip) => {
    const today = new Date().toISOString().slice(0,10);
    // PostgreSQL : DATE(created_at) = $1 ; SQLite : created_at LIKE '2024-01-01%'
    const r = await db('prompts').where({ guest_ip: ip })
      .whereRaw("created_at::date = ?", [today])
      .count('id as c').first()
      .catch(() =>
        db('prompts').where({ guest_ip: ip })
          .whereLike('created_at', today + '%')
          .count('id as c').first()
      );
    return r ? Number(r.c) : 0;
  }
};

// ─── FLASH CARD ───────────────────────────────────────────────
const FlashCard = {
  all       : ()    => db('flash_cards').where({ is_active: true }).orderBy('order_index'),
  byCategory: (cat) => db('flash_cards').where({ is_active: true, category: cat }).orderBy('order_index'),
  categories: ()    => db('flash_cards').distinct('category').pluck('category'),
  create    : (data) => db('flash_cards').insert(data),
  update    : (id, data) => db('flash_cards').where({ id }).update(data),
  delete    : (id)  => db('flash_cards').where({ id }).delete(),
  adminAll  : ()    => db('flash_cards').orderBy('category').orderBy('order_index')
};

// ─── ROADMAP ──────────────────────────────────────────────────
const Roadmap = {
  all    : () => db('roadmaps').where({ is_active: true }).orderBy('level'),
  byId   : async (id) => {
    const r = await db('roadmaps').where({ id }).first();
    if (r) r.steps = parseJSON(r.steps, []);
    return r;
  },
  create : (data) => db('roadmaps').insert(data),
  update : (id, data) => db('roadmaps').where({ id }).update(data),
  delete : (id)   => db('roadmaps').where({ id }).delete(),
  adminAll: ()    => db('roadmaps').orderBy('level')
};

// ─── TIP ──────────────────────────────────────────────────────
const Tip = {
  all      : (category) => {
    let q = db('tips').where({ is_active: true });
    if (category) q = q.where({ category });
    return q.orderBy('order_index');
  },
  categories: () => db('tips').distinct('category').pluck('category'),
  create    : (data) => db('tips').insert(data),
  update    : (id, data) => db('tips').where({ id }).update(data),
  delete    : (id)  => db('tips').where({ id }).delete(),
  adminAll  : ()    => db('tips').orderBy('category').orderBy('order_index')
};

// ─── LOG ──────────────────────────────────────────────────────
const Log = {
  recent : (limit) => db('activity_logs').orderBy('created_at','desc').limit(limit||50).catch(()=>[]),
  count  : ()      => db('activity_logs').count('id as c').first().then(r=>Number(r.c)).catch(()=>0),
  create : (data)  => db('activity_logs').insert(data).catch(()=>null),
};

// ─── SETTING ──────────────────────────────────────────────────
const Setting = {
  get   : async (key) => {
    const r = await db('site_settings').where({ key }).first();
    return r ? r.value : null;
  },
  set   : (key, value) => db('site_settings').where({ key }).update({ value, updated_at: new Date().toISOString() }),
  all   : () => db('site_settings').orderBy('key'),
  getMap: async () => {
    const rows = await db('site_settings');
    return rows.reduce((acc, r) => { acc[r.key] = r.value; return acc; }, {});
  }
};

// ─── FAVORITE ─────────────────────────────────────────────────
const Favorite = {
  add    : (userId, aiId) => db('favorites').insert({ user_id: userId, ai_id: aiId, created_at: new Date().toISOString() }).catch(()=>null),
  remove : (userId, aiId) => db('favorites').where({ user_id: userId, ai_id: aiId }).delete(),
  toggle : async (userId, aiId) => {
    const ex = await db('favorites').where({ user_id: userId, ai_id: aiId }).first();
    if (ex) { await db('favorites').where({ user_id: userId, ai_id: aiId }).delete(); return false; }
    await db('favorites').insert({ user_id: userId, ai_id: aiId, created_at: new Date().toISOString() });
    return true;
  },
  // ← hydrateAI ajouté ici pour que tags soit toujours un tableau
  forUser: (userId) =>
    db('favorites')
      .join('ai_tools','favorites.ai_id','ai_tools.id')
      .where({ 'favorites.user_id': userId, 'ai_tools.is_active': true })
      .select('ai_tools.*','favorites.created_at as fav_at')
      .orderBy('favorites.created_at','desc')
      .then(rows => rows.map(hydrateAI)),
  isLiked : async (userId, aiId) => !!(await db('favorites').where({ user_id: userId, ai_id: aiId }).first()),
  count   : (userId) => db('favorites').where({ user_id: userId }).count('id as c').first().then(r=>Number(r.c)),
  countAll: () => db('favorites').count('id as c').first().then(r=>Number(r.c)),
};

// ─── CHALLENGE ────────────────────────────────────────────────
const Challenge = {
  today: async () => {
    const date = new Date().toISOString().slice(0,10);
    let ch = await db('daily_challenges').where({ date, is_active: true }).first().catch(()=>null);
    if (!ch) {
      const card = await db('flash_cards').where({ is_active: true }).orderByRaw('RANDOM()').first().catch(()=>null);
      if (card) {
        const ids = await db('daily_challenges').insert({
          date, type:'flashcard', ref_id: card.id,
          challenge_text: 'Explique avec tes propres mots : "' + card.term + '"',
          is_active: true, created_at: new Date().toISOString()
        });
        const newId = Array.isArray(ids) ? ids[0] : ids;
        ch = await db('daily_challenges').where({ id: newId }).first().catch(()=>null);
      }
    }
    return ch || null;
  },
  complete: async (userId, challengeId) => {
    const date = new Date().toISOString().slice(0,10);
    const ex = await db('challenge_completions').where({ user_id: userId, date }).first();
    if (ex) return false;
    await db('challenge_completions').insert({ user_id: userId, date, challenge_id: challengeId, completed_at: new Date().toISOString() });
    const user = await db('users').where({ id: userId }).first();
    const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
    const newStreak = (user.streak_last_date === yesterday || user.streak_last_date === date)
      ? (user.streak||0)+1 : 1;
    await db('users').where({ id: userId }).update({ streak: newStreak, streak_last_date: date });
    return true;
  },
  isDoneToday: async (userId) => {
    const date = new Date().toISOString().slice(0,10);
    return !!(await db('challenge_completions').where({ user_id: userId, date }).first());
  },
  history: (limit) => db('daily_challenges').orderBy('date','desc').limit(limit||30),
};

// ─── PROGRESS ─────────────────────────────────────────────────
const Progress = {
  get: async (userId, roadmapId) => {
    const r = await db('roadmap_progress').where({ user_id: userId, roadmap_id: roadmapId }).first();
    if (!r) return [];
    try { return JSON.parse(r.completed_steps); } catch { return []; }
  },
  set: async (userId, roadmapId, steps) => {
    const ex = await db('roadmap_progress').where({ user_id: userId, roadmap_id: roadmapId }).first();
    const data = { completed_steps: JSON.stringify(steps), updated_at: new Date().toISOString() };
    if (ex) await db('roadmap_progress').where({ user_id: userId, roadmap_id: roadmapId }).update(data);
    else    await db('roadmap_progress').insert({ user_id: userId, roadmap_id: roadmapId, ...data });
  },
};

// ─── COLLECTION ───────────────────────────────────────────────
const Collection = {
  forUser    : (uid) => db('collections').where({ user_id: uid }).orderBy('created_at','desc'),
  byId       : (id)  => db('collections').where({ id }).first(),
  create     : (data)=> db('collections').insert({ ...data, created_at: new Date().toISOString() }),
  update     : (id, data) => db('collections').where({ id }).update(data),
  delete     : (id)  => db('collections').where({ id }).delete(),
  addPrompt  : (cid, pid) => db('collection_prompts').insert({ collection_id: cid, prompt_id: pid, added_at: new Date().toISOString() }).catch(()=>null),
  removePrompt:(cid, pid) => db('collection_prompts').where({ collection_id: cid, prompt_id: pid }).delete(),
  prompts    : (cid) => db('collection_prompts').join('prompts','collection_prompts.prompt_id','prompts.id').where({ collection_id: cid }).select('prompts.*').orderBy('added_at','desc'),
  public     : ()    => db('collections').where({ is_public: true }).orderBy('created_at','desc').limit(20),
};

// ─── REVIEW ───────────────────────────────────────────────────
const Review = {
  forAI    : (aiId) => db('ai_reviews').join('users','ai_reviews.user_id','users.id').where({ 'ai_reviews.ai_id': aiId }).select('ai_reviews.*','users.username').orderBy('ai_reviews.created_at','desc'),
  avgRating: (aiId) => db('ai_reviews').where({ ai_id: aiId }).avg('rating as avg').first().then(r => r ? Math.round((r.avg||0)*10)/10 : 0),
  count    : (aiId) => db('ai_reviews').where({ ai_id: aiId }).count('id as c').first().then(r=>Number(r.c)),
  byUser   : (uid, aiId) => db('ai_reviews').where({ user_id: uid, ai_id: aiId }).first(),
  create   : (data) => db('ai_reviews').insert({ ...data, created_at: new Date().toISOString() }),
  update   : (uid, aiId, data) => db('ai_reviews').where({ user_id: uid, ai_id: aiId }).update(data),
  delete   : (uid, aiId) => db('ai_reviews').where({ user_id: uid, ai_id: aiId }).delete(),
};

// ─── BADGES ───────────────────────────────────────────────────
const BADGE_DEFS = {
  'first_prompt'    : { label:'Premier pas',     icon:'⚡', desc:'Premier prompt généré' },
  'prompt_10'       : { label:'Prolifique',       icon:'🚀', desc:'10 prompts générés' },
  'prompt_50'       : { label:'Expert Prompteur', icon:'🎯', desc:'50 prompts générés' },
  'first_favorite'  : { label:'Curieux',          icon:'❤️', desc:'Première IA mise en favori' },
  'fav_10'          : { label:'Collectionneur',   icon:'💎', desc:'10 IAs en favoris' },
  'first_roadmap'   : { label:'En Route',         icon:'🗺️', desc:'Première étape cochée' },
  'roadmap_complete': { label:'Diplômé',          icon:'🎓', desc:'Roadmap complétée à 100%' },
  'streak_7'        : { label:'Assidu',           icon:'🔥', desc:'7 jours de streak' },
  'streak_30'       : { label:'Légende',          icon:'👑', desc:'30 jours de streak' },
  'first_review'    : { label:'Critique',         icon:'⭐', desc:'Premier avis posté' },
  'first_collection': { label:'Archiviste',       icon:'📂', desc:'Première collection créée' },
};

const Badge = {
  DEFS: BADGE_DEFS,
  forUser: async (uid) => {
    const rows = await db('user_badges').where({ user_id: uid }).orderBy('earned_at','asc');
    return rows.map(r => ({ ...r, ...(BADGE_DEFS[r.badge_key]||{}) }));
  },
  award: async (uid, key) => {
    if (!BADGE_DEFS[key]) return false;
    const ex = await db('user_badges').where({ user_id: uid, badge_key: key }).first();
    if (ex) return false;
    await db('user_badges').insert({ user_id: uid, badge_key: key, earned_at: new Date().toISOString() });
    return true;
  },
  check: async (uid) => {
    const [pc, fc, streak] = await Promise.all([
      db('prompts').where({ user_id: uid }).count('id as c').first().then(r=>Number(r.c)),
      db('favorites').where({ user_id: uid }).count('id as c').first().then(r=>Number(r.c)),
      db('users').where({ id: uid }).first().then(u=>u?u.streak||0:0),
    ]);
    const awarded = [];
    if (pc>=1)      { if (await Badge.award(uid,'first_prompt'))   awarded.push('first_prompt'); }
    if (pc>=10)     { if (await Badge.award(uid,'prompt_10'))      awarded.push('prompt_10'); }
    if (pc>=50)     { if (await Badge.award(uid,'prompt_50'))      awarded.push('prompt_50'); }
    if (fc>=1)      { if (await Badge.award(uid,'first_favorite')) awarded.push('first_favorite'); }
    if (fc>=10)     { if (await Badge.award(uid,'fav_10'))         awarded.push('fav_10'); }
    if (streak>=7)  { if (await Badge.award(uid,'streak_7'))       awarded.push('streak_7'); }
    if (streak>=30) { if (await Badge.award(uid,'streak_30'))      awarded.push('streak_30'); }
    return awarded;
  },
};

// ─── EXPORTS ──────────────────────────────────────────────────
module.exports = {
  User, AI, Prompt, FlashCard, Roadmap, Tip, Log, Setting,
  Favorite, Challenge, Progress, Collection, Review, Badge,
  parseJSON
};
