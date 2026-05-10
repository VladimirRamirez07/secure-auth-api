const router = require('express').Router();
const AdminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate, authorize('admin'));

router.get('/users', AdminController.listUsers);
router.put('/users/:id/toggle', AdminController.toggleUserStatus);

module.exports = router;