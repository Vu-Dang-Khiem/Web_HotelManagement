const BookingModel = require('../../models/booking.model');
const BookingService = require('../../services/booking.service');
const RoomModel = require('../../models/room.model');
const { buildPagination } = require('../../utils/pagination');
const appConfig = require('../../config/app.config');
const messages = require('../../constants/messages');

module.exports = {
  async index(req, res, next) {
    try {
      const filters = {};
      ['search', 'status', 'paymentStatus', 'fromDate', 'toDate'].forEach((k) => {
        if (req.query[k]) filters[k] = req.query[k];
      });
      const pageSize = appConfig.pageSize;
      const total = await BookingModel.count(filters);
      const pagination = buildPagination(total, req.query.page, pageSize, '/admin/dat-phong', req.query);
      const bookings = await BookingModel.findAll(filters, pageSize, pagination.offset);
      const stats = await BookingModel.countByStatus();
      res.render('admin/bookings/list', {
        title: 'Quản lý đặt phòng', bookings, stats, pagination, query: req.query,
      });
    } catch (err) { next(err); }
  },

  async detail(req, res, next) {
    try {
      const booking = await BookingService.getDetail(req.params.id);
      if (!booking) { req.flash('error', messages.NOT_FOUND); return res.redirect('/admin/dat-phong'); }
      // các phòng còn trống của loại này để gán
      const availableRooms = await RoomModel.findAvailable(
        booking.room_type_id, booking.check_in, booking.check_out, booking.id
      );
      res.render('admin/bookings/detail', { title: `Đơn ${booking.code}`, booking, availableRooms });
    } catch (err) { next(err); }
  },

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const action = req.body.action;
      if (action === 'confirm') await BookingService.confirm(id);
      else if (action === 'checkin') await BookingService.checkIn(id);
      else if (action === 'checkout') await BookingService.checkOut(id);
      else if (action === 'cancel') await BookingService.cancel(id);
      req.flash('success', messages.UPDATE_SUCCESS);
    } catch (err) {
      req.flash('error', err.message);
    }
    res.redirect(`/admin/dat-phong/${req.params.id}`);
  },

  async assignRoom(req, res) {
    try {
      await BookingModel.assignRoom(req.params.id, req.body.room_id);
      req.flash('success', 'Đã gán phòng cho đơn.');
    } catch (err) { req.flash('error', messages.SERVER_ERROR); }
    res.redirect(`/admin/dat-phong/${req.params.id}`);
  },

  async markPaid(req, res) {
    try {
      await BookingModel.updatePayment(req.params.id, 'paid', req.body.payment_method);
      req.flash('success', 'Đã cập nhật thanh toán.');
    } catch (err) { req.flash('error', messages.SERVER_ERROR); }
    res.redirect(`/admin/dat-phong/${req.params.id}`);
  },
};
