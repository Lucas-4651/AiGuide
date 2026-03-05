const express     = require('express');
const router      = express.Router();
const ctrl        = require('../controllers/adminController');
const { isAdmin } = require('../middlewares/auth');

// Login/Logout AVANT isAdmin
router.get('/login',  ctrl.showAdminLogin);
router.post('/login', ctrl.adminLogin);
router.get('/logout', ctrl.adminLogout);

// Tout ce qui suit = admin requis
router.use(isAdmin);

// Dashboard
router.get('/', ctrl.dashboard);

// IAs
router.get('/ais',             ctrl.listAIs);
router.get('/ais/new',         ctrl.newAIForm);
router.post('/ais',            ctrl.createAI);
router.get('/ais/:id/edit',    ctrl.editAIForm);
router.put('/ais/:id',         ctrl.updateAI);
router.delete('/ais/:id',      ctrl.deleteAI);

// Utilisateurs
router.get('/users',                ctrl.listUsers);
router.get('/users/:id',            ctrl.viewUser);
router.post('/users/:id/toggle',    ctrl.toggleUser);
router.post('/users/:id/role',      ctrl.changeRole);
router.delete('/users/:id',         ctrl.deleteUser);

// Prompts
router.get('/prompts',              ctrl.listPrompts);
router.delete('/prompts/:id',       ctrl.deletePrompt);

// Flash Cards
router.get('/content/flashcards',         ctrl.listFlashCards);
router.post('/content/flashcards',        ctrl.createFlashCard);
router.get('/content/flashcards/:id/edit', ctrl.editFlashCardForm);
router.put('/content/flashcards/:id',     ctrl.updateFlashCard);
router.delete('/content/flashcards/:id',  ctrl.deleteFlashCard);

// Tips
router.get('/content/tips',          ctrl.listTips);
router.post('/content/tips',         ctrl.createTip);
router.get('/content/tips/:id/edit', ctrl.editTipForm);
router.put('/content/tips/:id',      ctrl.updateTip);
router.delete('/content/tips/:id',   ctrl.deleteTip);

// Roadmaps
router.get('/roadmaps',             ctrl.listRoadmaps);
router.get('/roadmaps/new',         ctrl.newRoadmapForm);
router.post('/roadmaps',            ctrl.createRoadmap);
router.get('/roadmaps/:id/edit',    ctrl.editRoadmapForm);
router.put('/roadmaps/:id',         ctrl.updateRoadmap);
router.delete('/roadmaps/:id',      ctrl.deleteRoadmap);

// Logs & Settings
router.get('/logs',      ctrl.logs);
router.get('/settings',  ctrl.settings);
router.post('/settings', ctrl.updateSettings);

module.exports = router;
