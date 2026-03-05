# AI Guide 🤖

> Compagnon IA — du débutant à l'expert

## Stack
- **Backend** : Node.js + Express
- **DB Dev** : SQLite (better-sqlite3)
- **DB Prod** : PostgreSQL via Neon
- **Auth** : Passport.js (local + Google + GitHub)
- **Views** : EJS + express-ejs-layouts
- **IA** : OpenRouter (modèle gratuit)

---

## Installation rapide (Termux / Debian)

```bash
# 1. Clone ou copie le dossier ai-guide
cd ai-guide

# 2. Installe les dépendances
npm install

# 3. Copie le .env
cp .env.example .env
nano .env   # configure ton OPENROUTER_API_KEY au minimum

# 4. Crée les tables + seed de démarrage
npm run setup

# 5. Lance en dev
npm run dev

# Ouvre http://localhost:3000
```

---

## Comptes par défaut (seed)
| Email | Mot de passe | Rôle |
|---|---|---|
| admin@aiguide.com | admin123 | admin |

**Change ce mot de passe après le premier login !**

---

## Structure des fichiers

```
ai-guide/
├── app.js                        # Point d'entrée Express
├── .env.example                  # Variables d'environnement
├── src/
│   ├── config/
│   │   ├── database.js           # Knex (SQLite dev / PG prod)
│   │   └── passport.js           # Auth local + Google + GitHub
│   ├── middlewares/
│   │   ├── auth.js               # isAuth, isAdmin, isGuest
│   │   ├── rateLimiter.js        # express-rate-limit
│   │   └── activityLogger.js     # Winston + logs DB
│   ├── models/
│   │   └── index.js              # Toutes les requêtes DB (User, AI, Prompt...)
│   ├── services/
│   │   ├── openrouterService.js  # Appel API OpenRouter
│   │   └── recommenderService.js # Algo recommandation IA
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── publicController.js
│   │   ├── generatorController.js
│   │   └── adminController.js
│   └── routes/
│       ├── index.js              # Définition de toutes les routes
│       ├── public.js
│       ├── auth.js
│       ├── generator.js
│       └── admin.js
├── database/
│   ├── migrations/run.js         # Crée toutes les tables
│   └── seeds/seed.js             # Données initiales
├── views/
│   ├── layouts/
│   │   ├── main.ejs              # Layout public
│   │   ├── auth.ejs              # Layout login/register
│   │   └── admin.ejs             # Layout admin
│   ├── partials/
│   │   ├── navbar.ejs
│   │   ├── footer.ejs
│   │   └── flash.ejs
│   ├── pages/                    # Pages publiques
│   └── admin/                    # Pages admin
└── public/
    ├── css/
    │   ├── style.css             # Design system complet
    │   └── admin.css             # Styles admin
    └── js/main.js
```

---

## Pages disponibles

### Public
| Route | Description |
|---|---|
| `/` | Homepage avec IAs en vedette |
| `/explore` | Liste + filtres (type, prix, niveau, recherche) |
| `/explore/:slug` | Détail d'une IA |
| `/generator` | Générateur de prompts IA |
| `/generator/history` | Historique (connecté) |
| `/flashcards` | Flash Cards interactives |
| `/tips` | Astuces de prompting |
| `/roadmap` | Parcours d'apprentissage |
| `/compare?ids=1,2,3` | Comparateur d'IAs |
| `/recommend` | Recommandation selon projet (POST) |

### Auth
| Route | Description |
|---|---|
| `/auth/login` | Connexion locale |
| `/auth/register` | Inscription |
| `/auth/google` | OAuth Google |
| `/auth/github` | OAuth GitHub |
| `/auth/logout` | Déconnexion |

### Admin
| Route | Description |
|---|---|
| `/admin` | Dashboard stats |
| `/admin/ais` | Gestion des IAs (CRUD complet) |
| `/admin/users` | Gestion utilisateurs |
| `/admin/content/flashcards` | Gestion Flash Cards |
| `/admin/content/tips` | Gestion Astuces |
| `/admin/logs` | Logs & métriques |
| `/admin/settings` | Paramètres du site |

---

## Configuration OpenRouter (gratuit)

1. Crée un compte sur https://openrouter.ai
2. Génère une clé API
3. Dans `.env` : `OPENROUTER_API_KEY=sk-or-v1-...`
4. Modèle gratuit par défaut : `meta-llama/llama-3.1-8b-instruct:free`

---

## Passer en production (Neon PostgreSQL)

```bash
# Dans .env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require

# Lance les migrations sur Neon
npm run setup
```

---

## Ajouter des IAs via l'admin

1. Va sur `/admin/ais/new`
2. Remplis le formulaire (nom, type, description, points forts, limites, cas d'usage)
3. Les IAs sont **100% dynamiques** — rien n'est codé en dur

---

## Prochaines étapes suggérées

- [ ] Page de détail AI avec design avancé
- [ ] Prompt Challenge (gamification)
- [ ] Roadmap interactive avec étapes cliquables
- [ ] Export PDF d'un prompt
- [ ] API REST publique pour les IAs
- [ ] Système de favoris