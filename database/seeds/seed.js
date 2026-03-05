// ============================================================
//  database/seeds/seed.js
//  Lance avec : npm run seed
// ============================================================
const db2    = require('../../src/config/database');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  const exists = await db2('users').where({ email: 'admin@aiguide.com' }).first();
  if (exists) { console.log('  [SKIP] Admin deja present'); return; }
  const hash = await bcrypt.hash('admin123', 12);
  await db2('users').insert({
    email        : 'admin@aiguide.com',
    username     : 'Admin',
    password_hash: hash,
    role         : 'admin',
    is_active    : true,
    created_at   : new Date().toISOString()
  });
  console.log('  [OK] Admin cree : admin@aiguide.com / admin123');
}

async function seedAIs() {
  const count = await db2('ai_tools').count('id as c').first();
  if (Number(count.c) > 0) { console.log('  [SKIP] IAs deja presentes'); return; }

  const now = new Date().toISOString();
  await db2('ai_tools').insert([
    {
      name             : 'ChatGPT',
      slug             : 'chatgpt',
      short_description: 'Assistant conversationnel par OpenAI',
      description      : 'ChatGPT est un LLM conversationnel developpe par OpenAI. Il excelle dans la redaction, le code, l\'analyse et la conversation generale. Disponible en version gratuite (GPT-3.5) et payante (GPT-4).',
      type             : 'text_generation',
      provider         : 'OpenAI',
      website_url      : 'https://chat.openai.com',
      pricing_type     : 'freemium',
      price_info       : 'Gratuit (GPT-3.5) / 20$/mois (GPT-4o)',
      strengths        : JSON.stringify(['Tres polyvalent', 'Excellent en code', 'Interface intuitive', 'Plugin ecosystem']),
      limitations      : JSON.stringify(['Hallucinations possibles', 'Pas internet en version gratuite', 'Limite de contexte']),
      use_cases        : JSON.stringify(['Redaction', 'Code', 'Resume de texte', 'Traduction', 'Brainstorming', 'Analyse']),
      tags             : JSON.stringify(['nlp', 'chat', 'code', 'openai', 'gpt']),
      difficulty_level : 'beginner',
      is_featured      : true,
      is_active        : true,
      view_count       : 0,
      created_at       : now,
      updated_at       : now
    },
    {
      name             : 'Claude',
      slug             : 'claude',
      short_description: 'Assistant IA par Anthropic axe sur la securite',
      description      : 'Claude est un LLM developpe par Anthropic. Reconnu pour son honnetet, son excellente gestion des longs contextes et ses capacites d\'analyse approfondie.',
      type             : 'text_generation',
      provider         : 'Anthropic',
      website_url      : 'https://claude.ai',
      pricing_type     : 'freemium',
      price_info       : 'Gratuit / Pro 20$/mois',
      strengths        : JSON.stringify(['Contexte tres long (200k tokens)', 'Tres honnete', 'Excellent code', 'Analyse de documents']),
      limitations      : JSON.stringify(['Pas de navigation web en temps reel', 'Limite usage gratuit']),
      use_cases        : JSON.stringify(['Analyse de longs documents', 'Code complexe', 'Redaction longue forme', 'Recherche']),
      tags             : JSON.stringify(['nlp', 'chat', 'code', 'anthropic', 'analysis']),
      difficulty_level : 'beginner',
      is_featured      : true,
      is_active        : true,
      view_count       : 0,
      created_at       : now,
      updated_at       : now
    },
    {
      name             : 'Midjourney',
      slug             : 'midjourney',
      short_description: 'Generateur d\'images IA de haute qualite artistique',
      description      : 'Midjourney est un outil de generation d\'images par IA accessible via Discord. Reference pour ses resultats artistiques et photorealistiques de haute qualite.',
      type             : 'image_generation',
      provider         : 'Midjourney Inc.',
      website_url      : 'https://midjourney.com',
      pricing_type     : 'paid',
      price_info       : 'A partir de 10$/mois',
      strengths        : JSON.stringify(['Qualite artistique exceptionnelle', 'Styles tres varies', 'Tres creatif']),
      limitations      : JSON.stringify(['Payant uniquement', 'Via Discord seulement', 'Prompts complexes a maitriser']),
      use_cases        : JSON.stringify(['Art numerique', 'Illustrations', 'Concept art', 'Design graphique', 'Marketing visuel']),
      tags             : JSON.stringify(['image', 'art', 'design', 'creative', 'discord']),
      difficulty_level : 'intermediate',
      is_featured      : true,
      is_active        : true,
      view_count       : 0,
      created_at       : now,
      updated_at       : now
    },
    {
      name             : 'Gemini',
      slug             : 'gemini',
      short_description: 'Modele multimodal de Google',
      description      : 'Gemini est le modele d\'IA multimodal de Google. Il peut traiter texte, images, audio et video. Integration native avec les services Google.',
      type             : 'text_generation',
      provider         : 'Google',
      website_url      : 'https://gemini.google.com',
      pricing_type     : 'freemium',
      price_info       : 'Gratuit / Advanced 20$/mois',
      strengths        : JSON.stringify(['Multimodal natif', 'Integration Google Workspace', 'Acces web en temps reel']),
      limitations      : JSON.stringify(['Qualite variable selon les taches', 'Disponibilite limitee par region']),
      use_cases        : JSON.stringify(['Recherche web', 'Analyse d\'images', 'Integration Google Docs/Sheets', 'Coding']),
      tags             : JSON.stringify(['multimodal', 'google', 'chat', 'search', 'image']),
      difficulty_level : 'beginner',
      is_featured      : false,
      is_active        : true,
      view_count       : 0,
      created_at       : now,
      updated_at       : now
    },
    {
      name             : 'Stable Diffusion',
      slug             : 'stable-diffusion',
      short_description: 'Generateur d\'images open source en local',
      description      : 'Stable Diffusion est un modele de generation d\'images open source. Peut etre installe localement pour une utilisation gratuite et privee.',
      type             : 'image_generation',
      provider         : 'Stability AI',
      website_url      : 'https://stability.ai',
      pricing_type     : 'open_source',
      price_info       : 'Gratuit (auto-heberge) / API payante',
      strengths        : JSON.stringify(['100% gratuit en local', 'Prive et sans censure', 'Tres personnalisable', 'Milliers de modeles']),
      limitations      : JSON.stringify(['Installation technique requise', 'GPU puissant recommande', 'Courbe apprentissage elevee']),
      use_cases        : JSON.stringify(['Art numerique', 'Generation prive', 'Experimentation', 'Recherche IA']),
      tags             : JSON.stringify(['image', 'open-source', 'local', 'gratuit', 'stable-diffusion']),
      difficulty_level : 'advanced',
      is_featured      : false,
      is_active        : true,
      view_count       : 0,
      created_at       : now,
      updated_at       : now
    }
  ]);
  console.log('  [OK] 5 IAs inserees');
}

async function seedContent() {
  const cards = await db2('flash_cards').count('id as c').first();
  if (Number(cards.c) === 0) {
    await db2('flash_cards').insert([
      { term: 'LLM', definition: 'Large Language Model — modele de langage entraine sur de tres grands corpus de texte pour predire et generer du texte.', category: 'fondamentaux', difficulty: 1, order_index: 1, is_active: true, created_at: new Date().toISOString() },
      { term: 'Prompt', definition: 'Instruction ou question donnee a un modele IA pour orienter sa reponse. La qualite du prompt influence directement la qualite du resultat.', category: 'fondamentaux', difficulty: 1, order_index: 2, is_active: true, created_at: new Date().toISOString() },
      { term: 'Token', definition: 'Unite de base du texte pour les LLMs. 1 token = environ 4 caracteres ou 3/4 de mot en anglais. Les modeles ont une limite de tokens par requete.', category: 'technique', difficulty: 2, example: 'Le mot "bonjour" = 1-2 tokens selon le modele.', order_index: 3, is_active: true, created_at: new Date().toISOString() },
      { term: 'Hallucination', definition: 'Quand un LLM genere des informations fausses ou inventees avec un niveau de confiance eleve. Probleme majeur des modeles actuels.', category: 'fondamentaux', difficulty: 1, example: 'Inventer une citation, une date, ou un fait scientifique inexistant.', order_index: 4, is_active: true, created_at: new Date().toISOString() },
      { term: 'RAG', definition: 'Retrieval Augmented Generation — technique qui enrichit les reponses d\'un LLM avec des donnees externes recuperees en temps reel.', category: 'avance', difficulty: 3, example: 'Connecter un LLM a ta base de docs pour repondre sur tes propres donnees.', order_index: 5, is_active: true, created_at: new Date().toISOString() },
      { term: 'Fine-tuning', definition: 'Processus d\'entrainement supplementaire d\'un modele pre-entraine sur un dataset specifique pour l\'adapter a une tache particuliere.', category: 'avance', difficulty: 3, order_index: 6, is_active: true, created_at: new Date().toISOString() },
      { term: 'Temperature', definition: 'Parametre (0 a 1+) qui controle la creativite des reponses. Basse = previsible et precis, haute = creatif et varie.', category: 'technique', difficulty: 2, example: 'Temperature 0 pour du code. Temperature 0.9 pour de la poesie.', order_index: 7, is_active: true, created_at: new Date().toISOString() },
      { term: 'Embeddings', definition: 'Representations numeriques (vecteurs) de texte qui capturent le sens semantique. Utilises pour la recherche de similarite.', category: 'technique', difficulty: 3, order_index: 8, is_active: true, created_at: new Date().toISOString() }
    ]);
    console.log('  [OK] Flash cards inserees');
  } else {
    console.log('  [SKIP] Flash cards deja presentes');
  }

  const tips = await db2('tips').count('id as c').first();
  if (Number(tips.c) === 0) {
    await db2('tips').insert([
      { title: 'Sois specifique', content: 'Plus ton prompt est precis, meilleure sera la reponse. Evite les questions vagues comme "explique l\'IA". Prefere "Explique en 3 points simples ce qu\'est un LLM pour un debutant de 15 ans."', category: 'prompting', difficulty: 'beginner', order_index: 1, is_active: true, created_at: new Date().toISOString() },
      { title: 'Donne un role', content: 'Dis a l\'IA qui elle est. "Tu es un expert en cybersecurite avec 15 ans d\'experience..." change drastiquement la qualite et le registre de la reponse.', category: 'prompting', difficulty: 'beginner', order_index: 2, is_active: true, created_at: new Date().toISOString() },
      { title: 'Specifie le format', content: 'Demande explicitement le format voulu : liste a puces, tableau comparatif, JSON, code Python, email formel, tweet de 280 caracteres... L\'IA s\'adapte parfaitement.', category: 'prompting', difficulty: 'beginner', order_index: 3, is_active: true, created_at: new Date().toISOString() },
      { title: 'Utilise des exemples', content: 'La technique "few-shot prompting" consiste a donner 2-3 exemples de ce que tu veux avant de poser ta vraie question. C\'est l\'une des techniques les plus efficaces.', category: 'prompting', difficulty: 'intermediate', order_index: 4, is_active: true, created_at: new Date().toISOString() },
      { title: 'Decompose les taches complexes', content: 'Pour les taches complexes, decompose en etapes. "D\'abord fais X, ensuite Y, enfin Z." Ou demande a l\'IA de reflechir etape par etape avec "Let\'s think step by step".', category: 'prompting', difficulty: 'intermediate', order_index: 5, is_active: true, created_at: new Date().toISOString() }
    ]);
    console.log('  [OK] Tips inseres');
  } else {
    console.log('  [SKIP] Tips deja presents');
  }

  const settings = await db2('site_settings').count('id as c').first();
  if (Number(settings.c) === 0) {
    await db2('site_settings').insert([
      { key: 'site_name',            value: 'AI Guide',                      description: 'Nom du site' },
      { key: 'site_tagline',         value: 'Du debutant a l\'expert en IA', description: 'Tagline affiche sur la homepage' },
      { key: 'guest_prompt_limit',   value: '3',                             description: 'Nombre de prompts gratuits/jour pour les visiteurs' },
      { key: 'site_description',     value: 'La plateforme de reference pour apprendre et maitriser l\'IA', description: 'Meta description SEO' }
    ]);
    console.log('  [OK] Settings inseres');
  } else {
    console.log('  [SKIP] Settings deja presents');
  }
}

async function seedRoadmap() {
  const count = await db2('roadmaps').count('id as c').first();
  if (Number(count.c) > 0) { console.log('  [SKIP] Roadmaps deja presentes'); return; }
  await db2('roadmaps').insert([
    {
      title             : 'Debutant IA — Decouverte',
      description       : 'Parcours ideal pour decouvrir l\'IA de zero. Aucun prerequis technique.',
      level             : 'beginner',
      target_profile    : 'Toute personne curieuse sans experience IA',
      estimated_duration: '2-4 semaines',
      steps             : JSON.stringify([
        { order: 1, title: 'Comprendre c\'est quoi l\'IA', description: 'Lis les Flash Cards "fondamentaux". Comprends LLM, prompt, hallucination.', resource: '/flashcards?category=fondamentaux' },
        { order: 2, title: 'Tester ChatGPT', description: 'Cree un compte gratuit et teste des conversations basiques.', resource: 'https://chat.openai.com' },
        { order: 3, title: 'Apprendre a prompter', description: 'Lis les 5 astuces de base et applique-les.', resource: '/tips' },
        { order: 4, title: 'Explorer les autres IAs', description: 'Teste Claude et Gemini. Compare les reponses pour un meme prompt.', resource: '/explore' },
        { order: 5, title: 'Utiliser le generateur', description: 'Genere tes 3 premiers prompts optimises avec notre generateur.', resource: '/generator' }
      ]),
      is_active : true,
      created_at: new Date().toISOString()
    }
  ]);
  console.log('  [OK] Roadmap inseree');
}

async function run() {
  console.log('\nLancement du seed...\n');
  try {
    await seedAdmin();
    await seedAIs();
    await seedContent();
    await seedRoadmap();
    console.log('\nSeed termine avec succes !');
    console.log('Compte admin : admin@aiguide.com / admin123');
    await db2.destroy();
  } catch (e) {
    console.error('\nErreur seed:', e.message);
    process.exit(1);
  }
}

run();