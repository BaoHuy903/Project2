exports.requireLogin = (req, res, next) => {
  // Kiểm tra session: nếu KHÔNG có thông tin user → chưa đăng nhập
  if (!req.session.user) {
    return res.redirect('/users/login');
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  // Kiểm tra nếu đã đăng nhập và có role là 'admin'
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  // Nếu không phải admin, chặn và thông báo lỗi hoặc chuyển hướng
  res.status(403).send('Truy cập bị từ chối: Bạn không có quyền quản trị.');
};
