const ServiceModel = require('../../models/service.model');
const { buildPagination } = require('../../utils/pagination');
const { toInt } = require('../../utils/helpers');
const appConfig = require('../../config/app.config');
const messages = require('../../constants/messages');

function pick(body) {
  return {
    name: body.name,
    description: body.description,
    price: toInt(body.price),
    unit: body.unit || 'lần',
    icon: body.icon || 'fa-solid fa-concierge-bell',
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
      const total = await ServiceModel.count(filters);
      const pagination = buildPagination(total, req.query.page, pageSize, '/admin/dich-vu', req.query);
      const services = await ServiceModel.findAll(filters, pageSize, pagination.offset);
      res.render('admin/services/list', { title: 'Quản lý dịch vụ', services, pagination, query: req.query });
    } catch (err) { next(err); }
  },

  create(req, res) {
    res.render('admin/services/form', { title: 'Thêm dịch vụ', service: null });
  },

  async store(req, res, next) {
    try {
      await ServiceModel.create(pick(req.body));
      req.flash('success', messages.CREATE_SUCCESS);
      res.redirect('/admin/dich-vu');
    } catch (err) { next(err); }
  },

  async edit(req, res, next) {
    try {
      const service = await ServiceModel.findById(req.params.id);
      if (!service) { req.flash('error', messages.NOT_FOUND); return res.redirect('/admin/dich-vu'); }
      res.render('admin/services/form', { title: 'Sửa dịch vụ', service });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      await ServiceModel.update(req.params.id, pick(req.body));
      req.flash('success', messages.UPDATE_SUCCESS);
      res.redirect('/admin/dich-vu');
    } catch (err) { next(err); }
  },

  async destroy(req, res) {
    try {
      await ServiceModel.remove(req.params.id);
      req.flash('success', messages.DELETE_SUCCESS);
    } catch (err) { req.flash('error', 'Không thể xóa dịch vụ đang được sử dụng.'); }
    res.redirect('/admin/dich-vu');
  },
};
