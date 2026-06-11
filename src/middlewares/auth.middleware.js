const messages = require('../constants/messages');

// Yêu cầu đã đăng nhập (bất kỳ vai trò nào)
function requireAuth(req, res, next) {
  if (req.session.user) return next();
  req.flash('error', messages.LOGIN_REQUIRED);
  req.session.returnTo = req.originalUrl;
  return res.redirect('/login');
}

// Chỉ cho khách (chưa đăng nhập) - dùng cho trang login/register
function requireGuest(req, res, next) {
  if (!req.session.user) return next();
  return res.redirect('/');
}

module.exports = { requireAuth, requireGuest };
