const express  = require('express');
const router   = express.Router();
const pub      = require('../controllers/publicController');
const prof     = require('../controllers/profileController');
const favCtrl  = require('../controllers/favoritesController');
const chalCtrl = require('../controllers/challengeController');
const srchCtrl = require('../controllers/searchController');
const colCtrl  = require('../controllers/collectionsController');
const revCtrl  = require('../controllers/reviewsController');
const advCtrl  = require('../controllers/advisorController');
const { isAuth } = require('../middlewares/auth');

// ─── PUBLIC ───────────────────────────────────────────────────
router.get('/',              pub.home);
router.get('/explore',       pub.explore);
router.get('/explore/:slug', pub.aiDetail);
router.get('/tips',          pub.tips);
router.get('/flashcards',    pub.flashcards);
router.get('/roadmap',       pub.roadmap);
router.get('/roadmap/:id',   pub.roadmapDetail);
router.get('/compare',       pub.compare);
router.post('/recommend',    pub.recommendPost);
router.get('/nouveautes',    pub.nouveautes);

// ─── ADVISOR ──────────────────────────────────────────────────
router.get('/advisor',       advCtrl.show);
router.post('/advisor',      advCtrl.recommend);

// ─── SEARCH ───────────────────────────────────────────────────
router.get('/api/search',    srchCtrl.search);

// ─── PROFIL ───────────────────────────────────────────────────
router.get('/profile',         isAuth, prof.myProfile);
router.post('/profile/edit',   isAuth, prof.editProfile);
router.get('/profile/:id',     prof.publicProfile);

// ─── FAVORIS ──────────────────────────────────────────────────
router.get('/favorites',             isAuth, favCtrl.list);
router.post('/api/favorites/:aiId',  isAuth, favCtrl.toggle);

// ─── DÉFI ─────────────────────────────────────────────────────
router.post('/api/challenge/complete', isAuth, chalCtrl.complete);

// ─── COLLECTIONS ──────────────────────────────────────────────
router.get('/collections',              isAuth, colCtrl.list);
router.post('/collections',             isAuth, colCtrl.create);
router.get('/collections/:id',          colCtrl.detail);
router.delete('/collections/:id',       isAuth, colCtrl.delete);
router.post('/api/collections/add',     isAuth, colCtrl.addPrompt);
router.post('/collections/:cid/remove/:pid', isAuth, colCtrl.removePrompt);

// ─── REVIEWS ──────────────────────────────────────────────────
router.post('/api/reviews/:aiId',    isAuth, revCtrl.post);
router.delete('/api/reviews/:aiId',  isAuth, revCtrl.delete);

// ─── ROADMAP PROGRESS ─────────────────────────────────────────
router.post('/api/roadmap/progress', isAuth, pub.saveProgress);


// ─── BADGES ───────────────────────────────────────────────────
router.post('/api/badges/check', isAuth, async (req, res) => {
  try {
    const { Badge } = require('../models');
    const awarded = await Badge.check(req.user.id);
    const defs = Badge.DEFS;
    res.json({ new: awarded.map(k => ({ key:k, ...defs[k] })) });
  } catch(e){ res.json({ new:[] }); }
});

module.exports = router;
