const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const { requireLogin, isAdmin } = require('../middleware/auth');

// Tất cả các route trong admin đều cần đăng nhập và quyền admin
router.use(requireLogin, isAdmin);

router.get('/', adminCtrl.dashboard);

module.exports = router;
