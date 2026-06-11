const StatisticsService = require('../../services/statistics.service');

module.exports = {
  async index(req, res, next) {
    try {
      const year = parseInt(req.query.year, 10) || new Date().getFullYear();
      const data = await StatisticsService.revenueReport(year);
      // danh sách năm để chọn
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let y = currentYear; y >= currentYear - 4; y--) years.push(y);
      res.render('admin/statistics/index', { title: 'Thống kê & Báo cáo', ...data, years });
    } catch (err) { next(err); }
  },
};
