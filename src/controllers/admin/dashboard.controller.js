const StatisticsService = require('../../services/statistics.service');

module.exports = {
  async index(req, res, next) {
    try {
      const data = await StatisticsService.dashboard();
      res.render('admin/dashboard', { title: 'Bảng điều khiển', ...data });
    } catch (err) { next(err); }
  },
};
