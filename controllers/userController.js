const axios = require('axios');
const bcrypt = require('bcrypt');
const MOCK_API_BASE = 'https://69d242005043d95be971a7a0.mockapi.io/api/v1/users';

/**
 * Hiển thị form Đăng ký tài khoản
 */
exports.registerForm = (req, res) =>
  res.render('users/register', { title: 'Đăng ký', error: null });

/**
 * Xử lý logic Đăng ký tài khoản mới
 * Kiểm tra trùng lặp username, mã hóa mật khẩu và lưu lên MockAPI
 */
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const response = await axios.get(MOCK_API_BASE);
    const existingUser = response.data.find(u => u.username === username);
    
    if (existingUser) {
      return res.render('users/register', { 
        title: 'Đăng ký',
        error: 'Username đã tồn tại'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Mặc định đăng ký là 'user'
    await axios.post(MOCK_API_BASE, { 
      username, 
      password: hashedPassword, 
      role: 'user' 
    });
    res.redirect('/users/login');
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
 * Xác thực thông tin, cấp session và phân quyền điều hướng (Admin/User)
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const response = await axios.get(MOCK_API_BASE);
    const user = response.data.find(u => u.username === username);

    if (!user) return res.render('users/login', { 
      title: 'Đăng nhập',
      error: 'Sai tài khoản hoặc mật khẩu'
    });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.render('users/login', { 
      title: 'Đăng nhập',
      error: 'Sai tài khoản hoặc mật khẩu'
    });

    // Lưu role vào session
    req.session.user = { 
      id: user.id, 
      username: user.username, 
      role: user.role || 'user' 
    };

    if (req.session.user.role === 'admin') {
      res.redirect('/admin');
    } else {
      res.redirect('/rooms');
    }
  } catch (err) {
    res.render('users/login', { 
      title: 'Đăng nhập',
      error: 'Lỗi đăng nhập: ' + err.message
    });
  }
};

/**
 * Xử lý Đăng xuất
 * Xóa session hiện tại và đưa về trang đăng nhập
 */
exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/users/login'));
};
