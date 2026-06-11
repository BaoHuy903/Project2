const express = require('express');
const router = express.Router();
const path = require('path');
const roomCtrl = require('../controllers/roomController');
const { requireLogin, isLandlordOrAdmin } = require('../middleware/auth');
const roomValidator = require('../validators/roomValidator');
const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình Cloudinary Storage cho Multer
const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'trovip',
  allowedFormats: ['jpg', 'png', 'jpeg', 'webp']
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
