const db = require('../config/db');

const SELECT_BASE = `
  SELECT i.*, b.code AS booking_code, b.guest_name, b.guest_phone, b.check_in, b.check_out,
    b.nights, rt.name AS type_name, r.room_number, issuer.full_name AS issuer_name
  FROM invoices i
  JOIN bookings b ON i.booking_id = b.id
  JOIN room_types rt ON b.room_type_id = rt.id
  LEFT JOIN rooms r ON b.room_id = r.id
  LEFT JOIN users issuer ON i.issued_by = issuer.id
`;

const InvoiceModel = {
  _buildFilter(filters = {}) {
    const where = [];
    const params = [];
    if (filters.search) {
      where.push('(i.code LIKE ? OR b.code LIKE ? OR b.guest_name LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.paymentStatus) { where.push('i.payment_status = ?'); params.push(filters.paymentStatus); }
    return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
  },

  async findAll(filters = {}, limit = null, offset = 0) {
    const { clause, params } = this._buildFilter(filters);
    let sql = `${SELECT_BASE} ${clause} ORDER BY i.issued_at DESC`;
    if (limit !== null) { sql += ` LIMIT ? OFFSET ?`; params.push(limit, offset); }
    const [rows] = await db.query(sql, params);
    return rows;
  },

  async count(filters = {}) {
    const { clause, params } = this._buildFilter(filters);
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total FROM invoices i JOIN bookings b ON i.booking_id=b.id ${clause}`, params
    );
    return rows[0].total;
  },

  async findById(id) {
    const [rows] = await db.query(`${SELECT_BASE} WHERE i.id=? LIMIT 1`, [id]);
    return rows[0];
  },

  async findByBooking(bookingId) {
    const [rows] = await db.query(`${SELECT_BASE} WHERE i.booking_id=? LIMIT 1`, [bookingId]);
    return rows[0];
  },

  async create(data) {
    const [r] = await db.query(
      `INSERT INTO invoices (code, booking_id, subtotal, discount, total, payment_method, payment_status, note, issued_by)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [data.code, data.booking_id, data.subtotal, data.discount || 0, data.total,
       data.payment_method || 'cash', data.payment_status || 'paid', data.note || null, data.issued_by || null]
    );
    return r.insertId;
  },

  async remove(id) {
    await db.query(`DELETE FROM invoices WHERE id=?`, [id]);
  },
};

module.exports = InvoiceModel;
