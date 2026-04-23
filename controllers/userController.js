const axios = require('axios');
const bcrypt = require('bcrypt');
const MOCK_API_BASE = 'https://69d242005043d95be971a7a0.mockapi.io/api/v1/users';

exports.registerForm = (req, res) =>
  res.render('users/register', { title: 'Đăng ký', error: null });

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
    await axios.post(MOCK_API_BASE, { username, password: hashedPassword });
    res.redirect('/users/login');
  } catch (err) {
    res.render('users/register', { 
      title: 'Đăng ký',
      error: 'Lỗi đăng ký: ' + err.message
    });
  }
};

exports.loginForm = (req, res) =>
  res.render('users/login', { title: 'Đăng nhập', error: null });

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

    req.session.user = { id: user.id, username: user.username };
    res.redirect('/users');
  } catch (err) {
    res.render('users/login', { 
      title: 'Đăng nhập',
      error: 'Lỗi đăng nhập: ' + err.message
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/users/login'));
};

exports.index = async (req, res) => {
  try {
    const response = await axios.get(MOCK_API_BASE);
    res.render('users/index', {
      title: 'Quản lý User',
      users: response.data,
      user: req.session.user
    });
  } catch (err) {
    res.status(500).send('Lỗi: ' + err.message);
  }
};