// Xử lý route không tồn tại (404)
module.exports = function notFoundMiddleware(req, res) {
  res.status(404).render('errors/404', {
    layout: 'layouts/client',
    title: 'Không tìm thấy trang',
  });
};
