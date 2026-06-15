const path = require('path');
const express = require('express');
const session = require('express-session');
const { ROLES } = require('./constants');
require('dotenv').config();

const app = express();

// =============================================
// View Engine
// =============================================
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'ejs');

// =============================================
// Body Parsers & Static Files
// =============================================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// =============================================
// Session
// =============================================
app.use(session({
  secret: process.env.SESSION_SECRET || 'trovip_secret_key_change_in_production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 giờ
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// =============================================
// Middleware
// =============================================
const { preventCSRF } = require('./middleware/auth');
const { injectLocals } = require('./middleware/locals');

app.use(preventCSRF);
app.use(injectLocals); // Inject ROLES & sessionUser vào res.locals cho mọi view

// =============================================
// Routes
// =============================================
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const roomRoutes = require('./routes/roomRoutes');

app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/rooms', roomRoutes);

// =============================================
// Root → Landing Page
// =============================================
app.get('/', async (req, res) => {
  try {
    const roomService = require('./services/roomService');
    const { rooms } = await roomService.getRoomsHome();
    res.render('landing', {
      title: 'TrọVíp - Nền tảng tìm kiếm phòng trọ hàng đầu Đà Nẵng',
      rooms: rooms.slice(0, 6),
      user: req.session.user || null
    });
  } catch (err) {
    res.render('landing', {
      title: 'TrọVíp - Nền tảng tìm kiếm phòng trọ hàng đầu Đà Nẵng',
      rooms: [],
      user: req.session.user || null
    });
  }
});

// =============================================
// Shorthand Redirects (Avoid 404s)
// =============================================
app.get('/login', (req, res) => res.redirect('/users/login'));
app.get('/register', (req, res) => res.redirect('/users/register'));
app.get('/logout', (req, res) => res.redirect('/users/logout'));
app.get('/post-room', (req, res) => res.redirect('/rooms/add'));
app.get('/profile', (req, res) => res.redirect('/users/change-password'));
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === ROLES.ADMIN) return res.redirect('/admin');
    if (req.session.user.role === ROLES.LANDLORD) return res.redirect('/rooms/dashboard');
  }
  res.redirect('/users/login');
});

// =============================================
// 404 Handler
// =============================================
app.use((req, res) => {
  res.status(404).render('landing', {
    title: 'Trang không tìm thấy - TrọVíp',
    rooms: [],
    user: req.session.user || null
  });
});

// =============================================
// Global Error Handler
// =============================================
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File ảnh quá lớn (tối đa 10MB).' });
  }
  res.status(500).send('Lỗi máy chủ: ' + (process.env.NODE_ENV === 'production' ? 'Vui lòng thử lại.' : err.message));
});

// =============================================
// Start Server
// =============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));
