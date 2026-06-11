const StatisticsService = require('../../services/statistics.service');

module.exports = {
  async index(req, res, next) {
    try {
      const data = await StatisticsService.staffDashboard();
      res.render('staff/dashboard', { title: 'Lễ tân - Tổng quan', ...data });
    } catch (err) { next(err); }
  },
};
