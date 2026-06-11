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
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 giờ
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
// Root redirect
// =============================================
app.get('/', (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === ROLES.ADMIN) return res.redirect('/admin');
    if (req.session.user.role === ROLES.LANDLORD) return res.redirect('/rooms/dashboard');
    return res.redirect('/rooms');
  }
  res.redirect('/users/login');
});

// =============================================
// Start Server
// =============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));
