const InvoiceModel = require('../../models/invoice.model');
const InvoiceService = require('../../services/invoice.service');
const BookingService = require('../../services/booking.service');
const { buildPagination } = require('../../utils/pagination');
const appConfig = require('../../config/app.config');
const messages = require('../../constants/messages');

module.exports = {
  async index(req, res, next) {
    try {
      const filters = {};
      if (req.query.search) filters.search = req.query.search;
      if (req.query.paymentStatus) filters.paymentStatus = req.query.paymentStatus;
      const pageSize = appConfig.pageSize;
      const total = await InvoiceModel.count(filters);
      const pagination = buildPagination(total, req.query.page, pageSize, '/staff/hoa-don', req.query);
      const invoices = await InvoiceModel.findAll(filters, pageSize, pagination.offset);
      res.render('staff/invoices/list', { title: 'Quản lý hóa đơn', invoices, pagination, query: req.query });
    } catch (err) { next(err); }
  },

  // Lập hóa đơn từ 1 đơn đặt phòng
  async createFromBooking(req, res) {
    try {
      const invoice = await InvoiceService.createFromBooking(req.params.bookingId, {
        method: req.body.payment_method || 'cash',
        note: req.body.note,
        issuedBy: req.session.user.id,
        doCheckout: req.body.checkout === 'on',
      });
      req.flash('success', 'Đã lập hóa đơn thành công.');
      res.redirect(`/staff/hoa-don/${invoice.id}`);
    } catch (err) {
      req.flash('error', err.message);
      res.redirect(`/staff/dat-phong/${req.params.bookingId}`);
    }
  },

  async detail(req, res, next) {
    try {
      const invoice = await InvoiceService.getDetail(req.params.id);
      if (!invoice) { req.flash('error', messages.NOT_FOUND); return res.redirect('/staff/hoa-don'); }
      res.render('staff/invoices/detail', { title: `Hóa đơn ${invoice.code}`, invoice });
    } catch (err) { next(err); }
  },

  // Bản in hóa đơn (layout trống)
  async print(req, res, next) {
    try {
      const invoice = await InvoiceService.getDetail(req.params.id);
      if (!invoice) return res.redirect('/staff/hoa-don');
      res.render('staff/invoices/print', { title: `In hóa đơn ${invoice.code}`, invoice, layout: false });
    } catch (err) { next(err); }
  },
};
