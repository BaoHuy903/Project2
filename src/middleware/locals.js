const { ROLES, AMENITIES } = require('../constants');

/**
 * Middleware: Inject các biến dùng chung vào res.locals
 * để tất cả EJS templates đều có thể truy cập mà không cần
 * truyền thủ công qua mỗi res.render()
 */
const injectLocals = (req, res, next) => {
  // Inject ROLES constants để views không cần hardcode chuỗi
  res.locals.ROLES = ROLES;

  // Inject AMENITIES constants
  res.locals.AMENITIES = AMENITIES;

  // Inject user session (tiện lợi, không cần truyền qua từng controller)
  res.locals.sessionUser = req.session.user || null;

  next();
};

module.exports = { injectLocals };
