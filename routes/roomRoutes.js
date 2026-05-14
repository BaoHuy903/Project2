const express = require('express');
const router = express.Router();
const roomCtrl = require('../controllers/roomController');
const { requireLogin, isAdmin } = require('../middleware/auth');
const multer = require('multer');

// Cấu hình lưu trữ file với Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Lưu vào public/uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Trang chủ hiển thị phòng
router.get('/', roomCtrl.index);

// Quản trị viên thêm phòng
router.get('/add', requireLogin, isAdmin, roomCtrl.newRoomForm);
router.post('/create', requireLogin, isAdmin, upload.array('images', 10), roomCtrl.createRoom);

module.exports = router;
