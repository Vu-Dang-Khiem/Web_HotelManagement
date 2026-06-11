const InvoiceModel = require('../models/invoice.model');
const BookingModel = require('../models/booking.model');
const BookingService = require('./booking.service');
const { generateCode } = require('../utils/helpers');
const bookingStatus = require('../constants/bookingStatus');
const messages = require('../constants/messages');

const InvoiceService = {
  // Lập hóa đơn từ 1 đơn đặt phòng và đánh dấu đã thanh toán + trả phòng
  async createFromBooking(bookingId, { method = 'cash', note = '', issuedBy = null, doCheckout = true }) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new Error(messages.NOT_FOUND);

    const existing = await InvoiceModel.findByBooking(bookingId);
    if (existing) throw new Error('Đơn này đã có hóa đơn.');

    const subtotal = Number(booking.room_total) + Number(booking.services_total);
    const invoiceId = await InvoiceModel.create({
      code: generateCode('INV'),
      booking_id: bookingId,
      subtotal,
      discount: Number(booking.discount),
      total: Number(booking.total_amount),
      payment_method: method,
      payment_status: 'paid',
      note,
      issued_by: issuedBy,
    });

    await BookingModel.updatePayment(bookingId, 'paid', method);
    if (doCheckout && booking.status === bookingStatus.CHECKED_IN) {
      await BookingService.checkOut(bookingId);
    }
    return await InvoiceModel.findById(invoiceId);
  },

  async getDetail(invoiceId) {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) return null;
    const BookingServiceModel = require('../models/bookingService.model');
    invoice.services = await BookingServiceModel.findByBooking(invoice.booking_id);
    return invoice;
  },
};

module.exports = InvoiceService;
