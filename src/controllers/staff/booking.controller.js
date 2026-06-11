const BookingModel = require('../../models/booking.model');
const BookingService = require('../../services/booking.service');
const RoomTypeModel = require('../../models/roomType.model');
const ServiceModel = require('../../models/service.model');
const RoomModel = require('../../models/room.model');
const { buildPagination } = require('../../utils/pagination');
const appConfig = require('../../config/app.config');
const messages = require('../../constants/messages');

function parseServices(body) {
  const result = [];
  for (const key in body) {
    const m = key.match(/^services_(\d+)$/);
    if (m) {
      const qty = parseInt(body[key], 10);
      if (qty > 0) result.push({ id: m[1], quantity: qty });
    }
  }
  return result;
}

module.exports = {
  async index(req, res, next) {
    try {
      const filters = {};
      ['search', 'status', 'paymentStatus'].forEach((k) => { if (req.query[k]) filters[k] = req.query[k]; });
      if (req.query.today) filters.today = true;
      const pageSize = appConfig.pageSize;
      const total = await BookingModel.count(filters);
      const pagination = buildPagination(total, req.query.page, pageSize, '/staff/dat-phong', req.query);
      const bookings = await BookingModel.findAll(filters, pageSize, pagination.offset);
      const stats = await BookingModel.countByStatus();
      res.render('staff/bookings/list', { title: 'Quản lý đặt phòng', bookings, stats, pagination, query: req.query });
    } catch (err) { next(err); }
  },

  async detail(req, res, next) {
    try {
      const booking = await BookingService.getDetail(req.params.id);
      if (!booking) { req.flash('error', messages.NOT_FOUND); return res.redirect('/staff/dat-phong'); }
      const availableRooms = await RoomModel.findAvailable(
        booking.room_type_id, booking.check_in, booking.check_out, booking.id
      );
      res.render('staff/bookings/detail', { title: `Đơn ${booking.code}`, booking, availableRooms });
    } catch (err) { next(err); }
  },

  // Form đặt phòng tại quầy (walk-in)
  async create(req, res, next) {
    try {
      const [roomTypes, services] = await Promise.all([
        RoomTypeModel.findAll({ status: 'active' }), ServiceModel.findActive(),
      ]);
      res.render('staff/bookings/create', { title: 'Đặt phòng tại quầy', roomTypes, services });
    } catch (err) { next(err); }
  },

  async store(req, res, next) {
    try {
      const booking = await BookingService.create({
        room_type_id: req.body.room_type_id,
        user_id: null,
        guest_name: req.body.guest_name,
        guest_phone: req.body.guest_phone,
        guest_email: req.body.guest_email,
        check_in: req.body.check_in,
        check_out: req.body.check_out,
        adults: parseInt(req.body.adults, 10) || 1,
        children: parseInt(req.body.children, 10) || 0,
        services: parseServices(req.body),
        promoCode: req.body.promo_code,
        special_request: req.body.special_request,
        payment_method: req.body.payment_method,
      }, { status: 'confirmed', createdBy: req.session.user.id });
      req.flash('success', 'Đã tạo đơn đặt phòng.');
      res.redirect(`/staff/dat-phong/${booking.id}`);
    } catch (err) {
      req.flash('error', err.message);
      req.flash('formData', req.body);
      res.redirect('/staff/dat-phong/them');
    }
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
    } catch (err) { req.flash('error', err.message); }
    res.redirect(`/staff/dat-phong/${req.params.id}`);
  },

  async assignRoom(req, res) {
    try {
      await BookingModel.assignRoom(req.params.id, req.body.room_id);
      req.flash('success', 'Đã gán phòng cho đơn.');
    } catch (err) { req.flash('error', messages.SERVER_ERROR); }
    res.redirect(`/staff/dat-phong/${req.params.id}`);
  },
};
