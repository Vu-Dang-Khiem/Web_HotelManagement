const db = require('../config/db');

const BookingServiceModel = {
  async bulkCreate(bookingId, items = []) {
    if (!items.length) return;
    const rows = items.map((it) => [bookingId, it.service_id, it.quantity, it.price]);
    await db.query(
      `INSERT INTO booking_services (booking_id, service_id, quantity, price) VALUES ?`, [rows]
    );
  },

  async findByBooking(bookingId) {
    const [rows] = await db.query(
      `SELECT bs.*, s.name, s.unit, s.icon
       FROM booking_services bs JOIN services s ON bs.service_id = s.id
       WHERE bs.booking_id = ?`, [bookingId]
    );
    return rows;
  },

  async removeByBooking(bookingId) {
    await db.query(`DELETE FROM booking_services WHERE booking_id=?`, [bookingId]);
  },
};

module.exports = BookingServiceModel;
