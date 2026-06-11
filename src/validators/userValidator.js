const User = require('../models/User');

const validateRegister = (req, res, next) => {
  const { username, password, role } = req.body;

  if (!username || username.trim().length < 3) {
    return res.render('users/register', { 
      title: 'Đăng ký',
      error: 'Tài khoản phải dài tối thiểu 3 ký tự và không chứa ký tự đặc biệt'
    });
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return res.render('users/register', { 
      title: 'Đăng ký',
      error: 'Tài khoản chỉ được chứa chữ cái, chữ số và dấu gạch dưới'
    });
  }

  if (!User.validatePasswordStrength(password)) {
    return res.render('users/register', { 
      title: 'Đăng ký',
      error: 'Mật khẩu phải dài tối thiểu 6 ký tự, bao gồm ít nhất 1 chữ cái và 1 chữ số'
    });
  }

  if (!role || !['TENANT', 'LANDLORD'].includes(role)) {
    return res.render('users/register', { 
      title: 'Đăng ký',
      error: 'Vui lòng chọn vai trò hợp lệ (Khách thuê hoặc Chủ trọ)'
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('users/login', { 
      title: 'Đăng nhập',
      error: 'Vui lòng nhập đầy đủ tài khoản và mật khẩu'
    });
  }

  next();
};

const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.render('users/change-password', {
      title: 'Đổi mật khẩu',
      user: req.session.user,
      error: 'Vui lòng điền đầy đủ tất cả các trường.',
      success: null
    });
  }

  if (newPassword !== confirmPassword) {
    return res.render('users/change-password', {
      title: 'Đổi mật khẩu',
      user: req.session.user,
      error: 'Xác nhận mật khẩu mới không khớp.',
      success: null
    });
  }

  if (!User.validatePasswordStrength(newPassword)) {
    return res.render('users/change-password', {
      title: 'Đổi mật khẩu',
      user: req.session.user,
      error: 'Mật khẩu mới phải dài tối thiểu 6 ký tự, bao gồm ít nhất 1 chữ cái và 1 chữ số.',
      success: null
    });
  }

  if (currentPassword === newPassword) {
    return res.render('users/change-password', {
      title: 'Đổi mật khẩu',
      user: req.session.user,
      error: 'Mật khẩu mới phải khác mật khẩu hiện tại.',
      success: null
    });
  }

  next();
};

const validateForgotPassword = (req, res, next) => {
  const { username, newPassword, confirmPassword } = req.body;

  if (!username || !newPassword || !confirmPassword) {
    return res.render('users/forgot-password', {
      title: 'Quên mật khẩu',
      error: 'Vui lòng nhập đầy đủ tất cả thông tin.',
      success: null
    });
  }

  if (newPassword !== confirmPassword) {
    return res.render('users/forgot-password', {
      title: 'Quên mật khẩu',
      error: 'Xác nhận mật khẩu mới không khớp.',
      success: null
    });
  }

  if (!User.validatePasswordStrength(newPassword)) {
    return res.render('users/forgot-password', {
      title: 'Quên mật khẩu',
      error: 'Mật khẩu mới phải dài tối thiểu 6 ký tự, bao gồm ít nhất 1 chữ cái và 1 chữ số.',
      success: null
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateForgotPassword
};
