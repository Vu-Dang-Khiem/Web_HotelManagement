const BookingService = require('../../services/booking.service');
const BookingModel = require('../../models/booking.model');
const RoomTypeModel = require('../../models/roomType.model');
const ServiceModel = require('../../models/service.model');
const { buildPagination } = require('../../utils/pagination');
const appConfig = require('../../config/app.config');
const messages = require('../../constants/messages');

// Chuyển các field services_<id> từ form thành mảng [{id, quantity}]
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
  // Form đặt phòng
  async showForm(req, res, next) {
    try {
      const roomType = await RoomTypeModel.findBySlug(req.params.slug);
      if (!roomType) return res.status(404).render('errors/404', { title: 'Không tìm thấy phòng' });
      const [services, amenities] = await Promise.all([
        ServiceModel.findActive(),
        RoomTypeModel.getAmenities(roomType.id),
      ]);
      res.render('client/booking/form', {
        title: `Đặt ${roomType.name}`,
        roomType: { ...roomType, amenities },
        services,
      });
    } catch (err) { next(err); }
  },

  // Tạo đơn đặt phòng
  async create(req, res, next) {
    try {
      const roomType = await RoomTypeModel.findBySlug(req.params.slug);
      if (!roomType) return res.status(404).render('errors/404', { title: 'Không tìm thấy phòng' });

      // Khách đã đăng nhập: ép dùng thông tin tài khoản (không cho sửa khi đặt phòng).
      // Khách vãng lai (chưa đăng nhập): lấy thông tin từ form.
      const sessionUser = req.session.user;
      const booking = await BookingService.create({
        room_type_id: roomType.id,
        user_id: sessionUser ? sessionUser.id : null,
        guest_name: sessionUser ? sessionUser.full_name : req.body.guest_name,
        guest_phone: sessionUser ? (sessionUser.phone || req.body.guest_phone) : req.body.guest_phone,
        guest_email: sessionUser ? sessionUser.email : req.body.guest_email,
        check_in: req.body.check_in,
        check_out: req.body.check_out,
        adults: parseInt(req.body.adults, 10) || 1,
        children: parseInt(req.body.children, 10) || 0,
        services: parseServices(req.body),
        promoCode: req.body.promo_code,
        special_request: req.body.special_request,
        payment_method: req.body.payment_method,
      }, { status: 'pending' });

      req.flash('success', messages.BOOKING_SUCCESS);
      if (req.body.payment_method === 'bidv') return res.redirect(`/dat-phong/thanh-toan/${booking.code}`);
      return res.redirect(`/dat-phong/thanh-cong/${booking.code}`);
    } catch (err) {
      req.flash('error', err.message);
      req.flash('formData', req.body);
      res.redirect(`/dat-phong/${req.params.slug}`);
    }
  },

  // Trang thanh toán BIDV
  async payment(req, res, next) {
    try {
      const booking = await BookingService.getDetail(
        (await BookingModel.findByCode(req.params.code))?.id
      );
      if (!booking) return res.status(404).render('errors/404', { title: 'Không tìm thấy đơn' });
      const amount = booking.total_amount;
      const info = encodeURIComponent(`Thanh toan dat phong ${booking.code}`);
      const accountName = encodeURIComponent(appConfig.bidv.accountName);
      const qrUrl = `https://img.vietqr.io/image/BIDV-${appConfig.bidv.accountNo}-compact2.png?amount=${amount}&addInfo=${info}&accountName=${accountName}`;
      res.render('client/booking/payment', {
        title: 'Thanh toán chuyển khoản BIDV',
        booking,
        bidv: appConfig.bidv,
        qrUrl,
      });
    } catch (err) { next(err); }
  },

  // Trang đặt phòng thành công
  async success(req, res, next) {
    try {
      const booking = await BookingService.getDetail(
        (await BookingModel.findByCode(req.params.code))?.id
      );
      if (!booking) return res.status(404).render('errors/404', { title: 'Không tìm thấy đơn' });
      res.render('client/booking/success', { title: 'Đặt phòng thành công', booking });
    } catch (err) { next(err); }
  },

  // Danh sách đơn của tôi
  async myBookings(req, res, next) {
    try {
      const filters = { userId: req.session.user.id };
      if (req.query.status) filters.status = req.query.status;
      const pageSize = appConfig.pageSize;
      const total = await BookingModel.count(filters);
      const pagination = buildPagination(total, req.query.page, pageSize, '/tai-khoan/don-dat', req.query);
      const bookings = await BookingModel.findAll(filters, pageSize, pagination.offset);
      res.render('client/booking/my-bookings', {
        title: 'Đơn đặt phòng của tôi',
        bookings, pagination, query: req.query,
      });
    } catch (err) { next(err); }
  },

  // Chi tiết đơn của tôi
  async detail(req, res, next) {
    try {
      const booking = await BookingService.getDetail(req.params.id);
      if (!booking || booking.user_id !== req.session.user.id) {
        return res.status(404).render('errors/404', { title: 'Không tìm thấy đơn' });
      }
      res.render('client/booking/detail', { title: `Đơn ${booking.code}`, booking });
    } catch (err) { next(err); }
  },

  // Hủy đơn
  async cancel(req, res) {
    try {
      await BookingService.cancel(req.params.id, req.session.user.id);
      req.flash('success', messages.BOOKING_CANCELLED);
    } catch (err) {
      req.flash('error', err.message);
    }
    res.redirect('/tai-khoan/don-dat');
  },
};
