// Tải axios để gọi API MockAPI
const axios = require('axios');

// Tải bcrypt để mã hóa password
const bcrypt = require('bcrypt');

// URL gốc của MockAPI
const MOCK_API_BASE = 'https://69d242005043d95be971a7a0.mockapi.io/api/v1/users';

// -------------------------------------------------------
// ĐĂNG KÝ
// -------------------------------------------------------

// Hiển thị form đăng ký (GET /users/register)
exports.registerForm = (req, res) =>
  res.render('users/register', { title: 'Đăng ký' });

// Xử lý đăng ký người dùng mới (POST /users/register)
exports.register = async (req, res) => {
  try {
    // Lấy username và password từ body của form POST
    const { username, password } = req.body;

    // Kiểm tra username đã tồn tại chưa
    const response = await axios.get(MOCK_API_BASE);
    const existingUser = response.data.find(u => u.username === username);
    
    if (existingUser) {
      return res.status(400).send('Username đã tồn tại');
    }

    // Mã hóa password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới qua MockAPI
    await axios.post(MOCK_API_BASE, {
      username,
      password: hashedPassword
    });

    // Đăng ký thành công → chuyển hướng đến trang đăng nhập
    res.redirect('/users/login');
  } catch (err) {
    res.status(400).send('Lỗi đăng ký: ' + err.message);
  }
};

// -------------------------------------------------------
// ĐĂNG NHẬP
// -------------------------------------------------------

// Hiển thị form đăng nhập (GET /users/login)
exports.loginForm = (req, res) =>
  res.render('users/login', { title: 'Đăng nhập' });

// Xử lý đăng nhập (POST /users/login)
exports.login = async (req, res) => {
  try {
    // Bước 1: Lấy username và password từ form
    const { username, password } = req.body;

    // Bước 2: Lấy tất cả users từ MockAPI
    const response = await axios.get(MOCK_API_BASE);
    
    // Bước 3: Tìm user theo username
    const user = response.data.find(u => u.username === username);

    // Nếu không tìm thấy user → trả về thông báo lỗi chung
    if (!user) return res.send('Sai tài khoản hoặc mật khẩu');

    // Bước 4: So sánh password nhập vào với hash đã lưu
    const match = await bcrypt.compare(password, user.password);

    // Nếu mật khẩu không khớp → trả về thông báo lỗi chung
    if (!match) return res.send('Sai tài khoản hoặc mật khẩu');

    // Bước 5: Đăng nhập thành công → lưu thông tin vào SESSION
    req.session.user = { id: user.id, username: user.username };

    // Bước 6: Chuyển hướng đến trang sản phẩm
    res.redirect('/products');
  } catch (err) {
    res.status(500).send('Lỗi đăng nhập: ' + err.message);
  }
};

// -------------------------------------------------------
// ĐĂNG XUẤT
// -------------------------------------------------------

// Xử lý đăng xuất (GET /users/logout)
exports.logout = (req, res) => {
  // Xóa hoàn toàn session trên server
  req.session.destroy(() => res.redirect('/users/login'));
};

// -------------------------------------------------------
// ADMIN — QUẢN LÝ DANH SÁCH USER
// -------------------------------------------------------

// Hiển thị danh sách tất cả users (GET /users)
exports.index = async (req, res) => {
  try {
    // Lấy toàn bộ users từ MockAPI
    const response = await axios.get(MOCK_API_BASE);
    const users = response.data;

    // Render trang quản lý user, truyền dữ liệu vào template
    res.render('users/index', {
      title: 'Quản lý User',
      users,               // Mảng tất cả users
      user: req.session.user // Người dùng đang đăng nhập
    });
  } catch (err) {
    res.status(500).send('Lỗi khi lấy danh sách users: ' + err.message);
  }
};