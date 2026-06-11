const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const { requireLogin } = require('../middleware/auth');
const userValidator = require('../validators/userValidator');

router.get('/register', userCtrl.registerForm);
router.post('/register', userValidator.validateRegister, userCtrl.register);

router.get('/login', userCtrl.loginForm);
router.post('/login', userValidator.validateLogin, userCtrl.login);

router.get('/logout', userCtrl.logout);

// Đổi mật khẩu (cần đăng nhập)
router.get('/change-password', requireLogin, userCtrl.changePasswordForm);
router.post('/change-password', requireLogin, userValidator.validateChangePassword, userCtrl.changePassword);

// Quên mật khẩu (không cần đăng nhập)
router.get('/forgot-password', userCtrl.forgotPasswordForm);
router.post('/forgot-password', userValidator.validateForgotPassword, userCtrl.forgotPassword);

module.exports = router;
