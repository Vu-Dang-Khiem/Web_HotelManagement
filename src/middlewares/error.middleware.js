const appConfig = require('../config/app.config');

// Xử lý lỗi tập trung (500)
// eslint-disable-next-line no-unused-vars
module.exports = function errorMiddleware(err, req, res, next) {
  console.error('✗ Lỗi:', err.stack || err);
  const isDev = appConfig.env === 'development';
  res.status(err.status || 500).render('errors/500', {
    layout: 'layouts/client',
    title: 'Lỗi hệ thống',
    error: isDev ? err : null,
  });
};
