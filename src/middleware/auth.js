const { ROLES } = require('../constants');

exports.requireLogin = (req, res, next) => {
  if (!req.session.user) {
    // Lưu URL hiện tại để redirect sau khi login
    req.session.returnTo = req.originalUrl;
    return res.redirect('/users/login');
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === ROLES.ADMIN) {
    return next();
  }
  res.status(403).render('users/login', {
    title: 'Không có quyền truy cập',
    error: 'Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản Admin.'
  });
};

exports.isLandlordOrAdmin = (req, res, next) => {
  if (
    req.session.user &&
    (req.session.user.role === ROLES.LANDLORD || req.session.user.role === ROLES.ADMIN)
  ) {
    return next();
  }
  res.status(403).render('users/login', {
    title: 'Không có quyền truy cập',
    error: 'Chức năng này chỉ dành cho Chủ trọ. Vui lòng đăng nhập bằng tài khoản Chủ trọ.'
  });
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
