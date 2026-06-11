const PromotionModel = require('../../models/promotion.model');
const { buildPagination } = require('../../utils/pagination');
const { toInt } = require('../../utils/helpers');
const appConfig = require('../../config/app.config');
const messages = require('../../constants/messages');

function pick(body) {
  return {
    code: (body.code || '').trim().toUpperCase(),
    name: body.name,
    description: body.description,
    discount_type: body.discount_type === 'amount' ? 'amount' : 'percent',
    discount_value: toInt(body.discount_value),
    min_total: toInt(body.min_total),
    start_date: body.start_date || null,
    end_date: body.end_date || null,
    status: body.status || 'active',
  };
}

module.exports = {
  async index(req, res, next) {
    try {
      const filters = {};
      if (req.query.search) filters.search = req.query.search;
      if (req.query.status) filters.status = req.query.status;
      const pageSize = appConfig.pageSize;
      const total = await PromotionModel.count(filters);
      const pagination = buildPagination(total, req.query.page, pageSize, '/admin/khuyen-mai', req.query);
      const promotions = await PromotionModel.findAll(filters, pageSize, pagination.offset);
      res.render('admin/promotions/list', { title: 'Quản lý khuyến mãi', promotions, pagination, query: req.query });
    } catch (err) { next(err); }
  },

  create(req, res) {
    res.render('admin/promotions/form', { title: 'Thêm khuyến mãi', promotion: null });
  },

  async store(req, res) {
    try {
      await PromotionModel.create(pick(req.body));
      req.flash('success', messages.CREATE_SUCCESS);
      res.redirect('/admin/khuyen-mai');
    } catch (err) {
      req.flash('error', 'Mã khuyến mãi có thể đã tồn tại.');
      res.redirect('/admin/khuyen-mai/them');
    }
  },

  async edit(req, res, next) {
    try {
      const promotion = await PromotionModel.findById(req.params.id);
      if (!promotion) { req.flash('error', messages.NOT_FOUND); return res.redirect('/admin/khuyen-mai'); }
      res.render('admin/promotions/form', { title: 'Sửa khuyến mãi', promotion });
    } catch (err) { next(err); }
  },

  async update(req, res) {
    try {
      await PromotionModel.update(req.params.id, pick(req.body));
      req.flash('success', messages.UPDATE_SUCCESS);
      res.redirect('/admin/khuyen-mai');
    } catch (err) {
      req.flash('error', 'Mã khuyến mãi có thể đã tồn tại.');
      res.redirect(`/admin/khuyen-mai/${req.params.id}/sua`);
    }
  },

  async destroy(req, res) {
    try {
      await PromotionModel.remove(req.params.id);
      req.flash('success', messages.DELETE_SUCCESS);
    } catch (err) { req.flash('error', messages.SERVER_ERROR); }
    res.redirect('/admin/khuyen-mai');
  },
};
