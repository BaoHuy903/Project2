const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const { requireLogin, isAdmin } = require('../middleware/auth');

// Tất cả các route trong admin đều cần đăng nhập và quyền admin
router.use(requireLogin, isAdmin);

router.get('/', adminCtrl.dashboard);
router.delete('/users/:id', adminCtrl.deleteUser);

// Quản lý phòng trọ (Admin) → dùng adminController, không dùng roomController
router.delete('/rooms/:id', adminCtrl.deleteRoom);
router.patch('/rooms/:id/status', adminCtrl.toggleRoomStatus);

module.exports = router;
