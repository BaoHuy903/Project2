// ====================================================
// routes/userRoutes.js — Định nghĩa các đường dẫn liên quan đến User
// ====================================================

// Tải Express để tạo router
const express = require('express');

// Tạo đối tượng router riêng (gắn vào app.js sau)
const router = express.Router();

// Tải controller xử lý logic cho user
const userCtrl = require('../controllers/userController');

// --- ĐĂNG KÝ ---
// GET  /users/register → hiển thị form đăng ký
router.get('/register', userCtrl.registerForm);
// POST /users/register → nhận dữ liệu, tạo user mới trong DB
router.post('/register', userCtrl.register);

// --- ĐĂNG NHẬP ---
// GET  /users/login → hiển thị form đăng nhập
router.get('/login', userCtrl.loginForm);
// POST /users/login → kiểm tra tài khoản/mật khẩu, tạo session
router.post('/login', userCtrl.login);

// --- ĐĂNG XUẤT ---
// GET /users/logout → xóa session, chuyển về trang login
router.get('/logout', userCtrl.logout);

// --- TRANG ADMIN: danh sách tất cả users ---
// ⚠️ Cảnh báo: route này chưa có middleware bảo vệ!
router.get('/', userCtrl.index);

// Xuất router để gắn vào app.js với app.use('/users', userRoutes)
module.exports = router;
