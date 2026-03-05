// ============================================================
//  src/routes/generator.js
// ============================================================
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/generatorController');
const { isAuth } = require('../middlewares/auth');
const { promptLimiter } = require('../middlewares/rateLimiter');

router.get('/',           ctrl.showGenerator);
router.post('/generate',  promptLimiter, ctrl.generate);
router.post('/rate',      ctrl.rate);
router.get('/history',    isAuth, ctrl.history);

module.exports = router;


