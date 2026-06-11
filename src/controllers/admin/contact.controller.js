const ContactModel = require('../../models/contact.model');
const { buildPagination } = require('../../utils/pagination');
const appConfig = require('../../config/app.config');
const messages = require('../../constants/messages');

module.exports = {
  async index(req, res, next) {
    try {
      const filters = {};
      if (req.query.search) filters.search = req.query.search;
      if (req.query.status) filters.status = req.query.status;
      const pageSize = appConfig.pageSize;
      const total = await ContactModel.count(filters);
      const pagination = buildPagination(total, req.query.page, pageSize, '/admin/lien-he', req.query);
      const contacts = await ContactModel.findAll(filters, pageSize, pagination.offset);
      res.render('admin/contacts/list', { title: 'Hộp thư liên hệ', contacts, pagination, query: req.query });
    } catch (err) { next(err); }
  },

  async show(req, res, next) {
    try {
      const contact = await ContactModel.findById(req.params.id);
      if (!contact) { req.flash('error', messages.NOT_FOUND); return res.redirect('/admin/lien-he'); }
      if (contact.status === 'new') await ContactModel.updateStatus(contact.id, 'replied');
      res.render('admin/contacts/detail', { title: 'Chi tiết liên hệ', contact });
    } catch (err) { next(err); }
  },

  async destroy(req, res) {
    try {
      await ContactModel.remove(req.params.id);
      req.flash('success', messages.DELETE_SUCCESS);
    } catch (err) { req.flash('error', messages.SERVER_ERROR); }
    res.redirect('/admin/lien-he');
  },
};
