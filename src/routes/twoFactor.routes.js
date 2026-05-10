const router = require('express').Router();
const TwoFactorController = require('../controllers/twoFactor.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/setup', authenticate, TwoFactorController.setup);
router.post('/verify', authenticate, TwoFactorController.verify);
router.post('/disable', authenticate, TwoFactorController.disable);

module.exports = router;