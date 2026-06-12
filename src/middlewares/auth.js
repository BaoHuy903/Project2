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

exports.isLandlordOrAdmin = (req, res, next) => {
  // Kiểm tra nếu đã đăng nhập và có role là 'CHỦ PHÒNG' hoặc 'admin'
  if (req.session.user && (req.session.user.role === 'CHỦ PHÒNG' || req.session.user.role === 'admin')) {
    return next();
  }
  res.status(403).send('Truy cập bị từ chối: Bạn không có quyền thực hiện chức năng này.');
};

exports.preventCSRF = (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();

  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const host = req.headers.host;

  // Kiểm tra nếu Origin hoặc Referer không khớp với Host của ứng dụng
  if (origin && !origin.includes(host)) {
    return res.status(403).send('Yêu cầu bị từ chối do phát hiện giả mạo CSRF (Origin mismatch).');
  }
  if (referer && !referer.includes(host)) {
    return res.status(403).send('Yêu cầu bị từ chối do phát hiện giả mạo CSRF (Referer mismatch).');
  }
  next();
};
