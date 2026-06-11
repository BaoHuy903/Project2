const userService = require('../services/userService');
const { ROLES } = require('../constants');

/**
 * Hiển thị form Đăng ký tài khoản
 */
exports.registerForm = (req, res) =>
  res.render('users/register', { title: 'Đăng ký', error: null });

/**
 * Xử lý logic Đăng ký tài khoản mới
 */
exports.register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    await userService.registerUser(username, password, role);
    res.redirect('/users/login?registered=true');
  } catch (err) {
    res.render('users/register', { 
      title: 'Đăng ký',
      error: 'Lỗi đăng ký: ' + err.message
    });
  }
};

/**
 * Hiển thị form Đăng nhập
 */
exports.loginForm = (req, res) =>
  res.render('users/login', { title: 'Đăng nhập', error: null });

/**
 * Xử lý logic Đăng nhập
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const sessionUser = await userService.loginUser(username, password);
    req.session.user = sessionUser;

    if (sessionUser.role === ROLES.ADMIN) {
      res.redirect('/admin');
    } else if (sessionUser.role === ROLES.LANDLORD) {
      res.redirect('/rooms/dashboard');
    } else {
      res.redirect('/rooms');
    }
  } catch (err) {
    res.render('users/login', { 
      title: 'Đăng nhập',
      error: 'Sai tài khoản hoặc mật khẩu'
    });
  }
};

/**
 * Xử lý Đăng xuất
 */
exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/users/login'));
};

/**
 * Hiển thị form Đổi mật khẩu
 */
exports.changePasswordForm = (req, res) => {
  res.render('users/change-password', {
    title: 'Đổi mật khẩu',
    user: req.session.user,
    error: null,
    success: null
  });
};

/**
 * Xử lý đổi mật khẩu
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(req.session.user.id, currentPassword, newPassword);
    
    res.render('users/change-password', {
      title: 'Đổi mật khẩu',
      user: req.session.user,
      error: null,
      success: 'Mật khẩu của bạn đã được thay đổi thành công!'
    });
  } catch (err) {
    res.render('users/change-password', {
      title: 'Đổi mật khẩu',
      user: req.session.user,
      error: 'Lỗi đổi mật khẩu: ' + err.message,
      success: null
    });
  }
};

/**
 * Hiển thị form Quên mật khẩu
 */
exports.forgotPasswordForm = (req, res) => {
  res.render('users/forgot-password', {
    title: 'Quên mật khẩu',
    error: null,
    success: null
  });
};

/**
 * Xử lý khôi phục mật khẩu (Quên mật khẩu)
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    await userService.forgotPassword(username, newPassword);
    
    res.render('users/forgot-password', {
      title: 'Quên mật khẩu',
      error: null,
      success: 'Mật khẩu mới của bạn đã được cập nhật thành công! Vui lòng quay lại trang đăng nhập.'
    });
  } catch (err) {
    res.render('users/forgot-password', {
      title: 'Quên mật khẩu',
      error: 'Lỗi khôi phục mật khẩu: ' + err.message,
      success: null
    });
  }
};