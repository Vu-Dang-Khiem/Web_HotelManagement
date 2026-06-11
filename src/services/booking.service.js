const dayjs = require('dayjs');
const BookingModel = require('../models/booking.model');
const BookingServiceModel = require('../models/bookingService.model');
const RoomTypeModel = require('../models/roomType.model');
const RoomModel = require('../models/room.model');
const ServiceModel = require('../models/service.model');
const PromotionService = require('./promotion.service');
const { generateCode } = require('../utils/helpers');
const { nightsBetween } = require('../utils/format');
const bookingStatus = require('../constants/bookingStatus');
const roomStatus = require('../constants/roomStatus');
const messages = require('../constants/messages');

const BookingService = {
  /**
   * Tính toán chi phí của 1 đơn (xem trước hoặc khi tạo).
   * payload: { roomType, check_in, check_out, services: [{id, quantity}], promoCode }
   */
  async calculate({ roomType, check_in, check_out, services = [], promoCode = '' }) {
    const nights = nightsBetween(check_in, check_out);
    if (nights <= 0) throw new Error(messages.INVALID_DATES);

    const roomPrice = Number(roomType.base_price);
    const roomTotal = roomPrice * nights;

    // Dịch vụ kèm theo
    let servicesTotal = 0;
    const serviceItems = [];
    for (const s of services) {
      if (!s.id || !s.quantity || s.quantity <= 0) continue;
      const svc = await ServiceModel.findById(s.id);
      if (!svc || svc.status !== 'active') continue;
      const qty = parseInt(s.quantity, 10);
      const lineTotal = Number(svc.price) * qty;
      servicesTotal += lineTotal;
      serviceItems.push({ service_id: svc.id, name: svc.name, quantity: qty, price: Number(svc.price), lineTotal });
    }

    const subtotal = roomTotal + servicesTotal;

    // Khuyến mãi
    let discount = 0;
    let promotion = null;
    if (promoCode && promoCode.trim()) {
      const result = await PromotionService.apply(promoCode, subtotal);
      promotion = result.promotion;
      discount = result.discount;
    }

    const total = subtotal - discount;
    return { nights, roomPrice, roomTotal, servicesTotal, serviceItems, subtotal, discount, total, promotion };
  },

  /**
   * Tạo đơn đặt phòng hoàn chỉnh.
   * input: thông tin khách + ngày + dịch vụ + promo. options: { status, createdBy, assignRoom }
   */
  async create(input, options = {}) {
    const roomType = await RoomTypeModel.findById(input.room_type_id);
    if (!roomType) throw new Error(messages.NOT_FOUND);

    // Kiểm tra ngày
    const today = dayjs().startOf('day');
    if (dayjs(input.check_in).isBefore(today)) {
      throw new Error('Ngày nhận phòng không được ở quá khứ.');
    }

    const calc = await this.calculate({
      roomType,
      check_in: input.check_in,
      check_out: input.check_out,
      services: input.services || [],
      promoCode: input.promoCode || '',
    });

    // Tìm phòng trống của loại này trong khoảng ngày
    let roomId = null;
    if (options.assignRoom !== false) {
      const available = await RoomModel.findAvailable(roomType.id, input.check_in, input.check_out);
      if (!available.length) throw new Error(messages.ROOM_NOT_AVAILABLE);
      roomId = available[0].id;
    }

    const bookingId = await BookingModel.create({
      code: generateCode('BK'),
      user_id: input.user_id || null,
      room_type_id: roomType.id,
      room_id: roomId,
      guest_name: input.guest_name,
      guest_phone: input.guest_phone,
      guest_email: input.guest_email,
      check_in: input.check_in,
      check_out: input.check_out,
      nights: calc.nights,
      adults: input.adults,
      children: input.children || 0,
      room_price: calc.roomPrice,
      room_total: calc.roomTotal,
      services_total: calc.servicesTotal,
      discount: calc.discount,
      total_amount: calc.total,
      promotion_id: calc.promotion ? calc.promotion.id : null,
      status: options.status || bookingStatus.PENDING,
      payment_status: options.payment_status || 'unpaid',
      payment_method: input.payment_method || 'cash',
      special_request: input.special_request,
      created_by: options.createdBy || null,
    });

    if (calc.serviceItems.length) {
      await BookingServiceModel.bulkCreate(bookingId, calc.serviceItems);
    }

    return await BookingModel.findById(bookingId);
  },

  // Khách hủy đơn (chỉ khi còn pending / confirmed)
  async cancel(bookingId, userId = null) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new Error(messages.NOT_FOUND);
    if (userId && booking.user_id !== userId) throw new Error(messages.ACCESS_DENIED);
    if (![bookingStatus.PENDING, bookingStatus.CONFIRMED].includes(booking.status)) {
      throw new Error('Không thể hủy đơn ở trạng thái hiện tại.');
    }
    await BookingModel.updateStatus(bookingId, bookingStatus.CANCELLED);
  },

  // Lễ tân/Admin xác nhận đơn
  async confirm(bookingId) {
    await BookingModel.updateStatus(bookingId, bookingStatus.CONFIRMED);
  },

  // Nhận phòng: đổi trạng thái booking + phòng
  async checkIn(bookingId) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new Error(messages.NOT_FOUND);
    await BookingModel.updateStatus(bookingId, bookingStatus.CHECKED_IN);
    if (booking.room_id) await RoomModel.updateStatus(booking.room_id, roomStatus.OCCUPIED);
  },

  // Trả phòng: đổi trạng thái booking + giải phóng phòng
  async checkOut(bookingId) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new Error(messages.NOT_FOUND);
    await BookingModel.updateStatus(bookingId, bookingStatus.CHECKED_OUT);
    if (booking.room_id) await RoomModel.updateStatus(booking.room_id, roomStatus.AVAILABLE);
  },

  // Lấy chi tiết đơn kèm dịch vụ
  async getDetail(bookingId) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) return null;
    booking.services = await BookingServiceModel.findByBooking(bookingId);
    return booking;
  },
};

module.exports = BookingService;
