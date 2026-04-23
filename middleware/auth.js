// requireLogin: middleware kiểm tra người dùng đã đăng nhập chưa
// Được gắn vào router bằng: router.use(requireLogin)
exports.requireLogin = (req, res, next) => {
  // Kiểm tra session: nếu KHÔNG có thông tin user → chưa đăng nhập
  if (!req.session.user) {
    // Chặn truy cập và chuyển hướng về trang đăng nhập
    return res.redirect('/users/login');
  }
  // Nếu đã đăng nhập → cho phép đi tiếp đến route/middleware kế tiếp
  next();
};
