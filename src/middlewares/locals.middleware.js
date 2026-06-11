const appConfig = require('../config/app.config');
const { formatCurrency, formatNumber, formatDate, formatDateTime } = require('../utils/format');
const roles = require('../constants/roles');
const bookingStatus = require('../constants/bookingStatus');
const roomStatus = require('../constants/roomStatus');
const paymentStatus = require('../constants/paymentStatus');

// Gắn các biến dùng chung vào res.locals để mọi view truy cập được
module.exports = function localsMiddleware(req, res, next) {
  res.locals.appName = appConfig.name;
  res.locals.currentUser = req.session.user || null;
  res.locals.currentUrl = req.originalUrl;
  res.locals.path = req.path;

  // Flash messages
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');
  res.locals.formData = req.flash('formData')[0] || {};

  // Helper định dạng
  res.locals.formatCurrency = formatCurrency;
  res.locals.formatNumber = formatNumber;
  res.locals.formatDate = formatDate;
  res.locals.formatDateTime = formatDateTime;

  // Hằng số
  res.locals.ROLES = roles;
  res.locals.BOOKING_STATUS = bookingStatus;
  res.locals.ROOM_STATUS = roomStatus;
  res.locals.PAYMENT_STATUS = paymentStatus;

  // Mặc định title / layout (controller có thể override)
  res.locals.title = appConfig.name;
  next();
};
