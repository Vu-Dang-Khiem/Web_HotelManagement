const messages = require('../constants/messages');
const roles = require('../constants/roles');

// Cho phép truy cập nếu vai trò người dùng nằm trong danh sách
function requireRole(...allowed) {
  return (req, res, next) => {
    const user = req.session.user;
    if (!user) {
      req.flash('error', messages.LOGIN_REQUIRED);
      req.session.returnTo = req.originalUrl;
      return res.redirect('/login');
    }
    if (!allowed.includes(user.role)) {
      // Trả về trang lỗi 403 tùy theo khu vực
      res.status(403);
      return res.render('errors/403', {
        layout: 'layouts/client',
        title: 'Không có quyền truy cập',
        message: messages.ACCESS_DENIED,
      });
    }
    return next();
  };
}

const requireAdmin = requireRole(roles.ADMIN);
const requireStaff = requireRole(roles.STAFF, roles.ADMIN); // admin cũng vào được khu lễ tân

module.exports = { requireRole, requireAdmin, requireStaff };
