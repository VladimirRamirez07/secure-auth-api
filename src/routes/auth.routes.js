const router = require('express').Router();
const AuthController = require('../controllers/auth.controller');
const { validate, registerRules, loginRules } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { authLimiter, registerLimiter } = require('../middlewares/rateLimit.middleware');

router.post('/register', registerLimiter, registerRules, validate, AuthController.register);
router.post('/login', authLimiter, loginRules, validate, AuthController.login);
router.post('/refresh-token', authLimiter, AuthController.refreshToken);
router.post('/logout', authenticate, AuthController.logout);

module.exports = router;