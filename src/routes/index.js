const clientRoutes = require('./client');
const adminRoutes = require('./admin');
const staffRoutes = require('./staff');

// Đăng ký toàn bộ route vào app
module.exports = function registerRoutes(app) {
  app.use('/admin', adminRoutes);
  app.use('/staff', staffRoutes);
  app.use('/', clientRoutes); // client để cuối cùng (catch-all các URL còn lại)
};
