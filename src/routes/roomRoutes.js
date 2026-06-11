const express = require('express');
const router = express.Router();
const path = require('path');
const roomCtrl = require('../controllers/roomController');
const { requireLogin, isLandlordOrAdmin } = require('../middleware/auth');
const roomValidator = require('../validators/roomValidator');
const multer = require('multer');

// Cấu hình lưu trữ file với Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Dùng absolute path để tránh lỗi relative path khi chạy từ các đường dẫn khác
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)'));
  }
});

// Trang chủ hiển thị phòng
router.get('/', roomCtrl.index);

// Bảng điều khiển của Chủ trọ
router.get('/dashboard', requireLogin, isLandlordOrAdmin, roomCtrl.landlordDashboard);

// Đăng phòng trọ (dành cho Chủ trọ hoặc Admin)
router.get('/add', requireLogin, isLandlordOrAdmin, roomCtrl.newRoomForm);
router.post('/create', requireLogin, isLandlordOrAdmin, upload.array('images', 10), roomValidator.validateRoom, roomCtrl.createRoom);

// Chỉnh sửa phòng trọ (dành cho Chủ trọ sở hữu phòng hoặc Admin)
router.get('/edit/:id', requireLogin, isLandlordOrAdmin, roomCtrl.editRoomForm);
router.post('/edit/:id', requireLogin, isLandlordOrAdmin, upload.array('images', 10), roomValidator.validateRoom, roomCtrl.updateRoom);

// API Xóa & Thay đổi trạng thái phòng (dành cho Chủ trọ hoặc Admin)
router.delete('/:id', requireLogin, isLandlordOrAdmin, roomCtrl.deleteRoom);
router.patch('/:id/status', requireLogin, isLandlordOrAdmin, roomCtrl.toggleRoomStatus);

module.exports = router;
