const ReviewModel = require('../../models/review.model');
const { buildPagination } = require('../../utils/pagination');
const appConfig = require('../../config/app.config');
const messages = require('../../constants/messages');

module.exports = {
  async index(req, res, next) {
    try {
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.rating) filters.rating = req.query.rating;
      const pageSize = appConfig.pageSize;
      const total = await ReviewModel.count(filters);
      const pagination = buildPagination(total, req.query.page, pageSize, '/admin/danh-gia', req.query);
      const reviews = await ReviewModel.findAll(filters, pageSize, pagination.offset);
      res.render('admin/reviews/list', { title: 'Quản lý đánh giá', reviews, pagination, query: req.query });
    } catch (err) { next(err); }
  },

  async toggle(req, res) {
    try {
      const review = await ReviewModel.findById(req.params.id);
      const newStatus = review.status === 'visible' ? 'hidden' : 'visible';
      await ReviewModel.updateStatus(req.params.id, newStatus);
      req.flash('success', `Đã ${newStatus === 'hidden' ? 'ẩn' : 'hiện'} đánh giá.`);
    } catch (err) { req.flash('error', messages.SERVER_ERROR); }
    res.redirect('/admin/danh-gia');
  },

  async destroy(req, res) {
    try {
      await ReviewModel.remove(req.params.id);
      req.flash('success', messages.DELETE_SUCCESS);
    } catch (err) { req.flash('error', messages.SERVER_ERROR); }
    res.redirect('/admin/danh-gia');
  },
};
