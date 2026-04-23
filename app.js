
// ====================================================
// app.js — File khởi động chính của ứng dụng
// ====================================================

// Tải framework Express để tạo web server
const express = require('express');

// Tải thư viện quản lý session (phiên đăng nhập)
const session = require('express-session');

// Đọc biến môi trường từ file .env (SESSION_SECRET, PORT...)
require('dotenv').config();

// Tạo ứng dụng Express
const app = express();

// Cài đặt EJS làm template engine (render file .ejs trong thư mục views/)
app.set('view engine', 'ejs');

// Middleware: parse dữ liệu từ form HTML (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Middleware: parse dữ liệu JSON từ request body
app.use(express.json());

// Middleware: phục vụ file tĩnh (CSS, JS, ảnh) từ thư mục public/
app.use(express.static('public'));

// Lấy khóa bí mật session từ .env, nếu không có thì dùng chuỗi mặc định
const sessionSecret = process.env.SESSION_SECRET || 'keyboard cat';

// Cấu hình session (sử dụng memory store, thích hợp cho development)
app.use(session({
  secret: sessionSecret,       // Khóa bí mật để ký và mã hóa session ID
  resave: false,               // Không lưu lại session nếu không có thay đổi
  saveUninitialized: false,    // Không tạo session cho người dùng chưa đăng nhập
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // Cookie tồn tại 24 giờ (ms)
}));

// Tải router quản lý người dùng (đăng ký, đăng nhập, đăng xuất)
const userRoutes    = require('./routes/userRoutes');

// Tải router quản lý sản phẩm (CRUD + tìm kiếm/lọc) - LƯU Ý: File chưa tồn tại
// const productRoutes = require('./routes/productRoutes');

// Gắn router vào đường dẫn tương ứng
app.use('/users',    userRoutes);    // Mọi request /users/... vào userRoutes
// app.use('/products', productRoutes); // Mọi request /products/... vào productRoutes

// Route gốc "/": kiểm tra trạng thái đăng nhập rồi điều hướng
app.get('/', (req, res) => {
  // Nếu session có user → đã đăng nhập → chuyển đến trang user list
  if (req.session.user) return res.redirect('/users');
  // Chưa đăng nhập → chuyển đến trang login
  res.redirect('/users/login');
});

// Lấy PORT từ biến môi trường, nếu không có thì mặc định 3000
const PORT = process.env.PORT || 3000;

// Khởi động server và lắng nghe kết nối
app.listen(PORT, () => console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`));
