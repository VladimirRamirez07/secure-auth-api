const router = require('express').Router();
const AuthController = require('../controllers/auth.controller');
const { validate, registerRules, loginRules } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/register', registerRules, validate, AuthController.register);
router.post('/login', loginRules, validate, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', authenticate, AuthController.logout);

module.exports = router;