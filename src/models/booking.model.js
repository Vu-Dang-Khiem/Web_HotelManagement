const db = require('../config/db');

const SELECT_BASE = `
  SELECT b.*,
    rt.name AS type_name, rt.thumbnail AS type_thumbnail, rt.slug AS type_slug,
    r.room_number,
    u.full_name AS user_name, u.email AS user_email,
    p.code AS promo_code,
    creator.full_name AS creator_name
  FROM bookings b
  JOIN room_types rt ON b.room_type_id = rt.id
  LEFT JOIN rooms r ON b.room_id = r.id
  LEFT JOIN users u ON b.user_id = u.id
  LEFT JOIN promotions p ON b.promotion_id = p.id
  LEFT JOIN users creator ON b.created_by = creator.id
`;

const BookingModel = {
  _buildFilter(filters = {}) {
    const where = [];
    const params = [];
    if (filters.search) {
      where.push('(b.code LIKE ? OR b.guest_name LIKE ? OR b.guest_phone LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.status) { where.push('b.status = ?'); params.push(filters.status); }
    if (filters.paymentStatus) { where.push('b.payment_status = ?'); params.push(filters.paymentStatus); }
    if (filters.userId) { where.push('b.user_id = ?'); params.push(filters.userId); }
    if (filters.typeId) { where.push('b.room_type_id = ?'); params.push(filters.typeId); }
    if (filters.fromDate) { where.push('b.check_in >= ?'); params.push(filters.fromDate); }
    if (filters.toDate) { where.push('b.check_in <= ?'); params.push(filters.toDate); }
    if (filters.today) { where.push('(b.check_in = CURDATE() OR b.check_out = CURDATE())'); }
    return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
  },

  async findAll(filters = {}, limit = null, offset = 0) {
    const { clause, params } = this._buildFilter(filters);
    let sql = `${SELECT_BASE} ${clause} ORDER BY b.created_at DESC`;
    if (limit !== null) { sql += ` LIMIT ? OFFSET ?`; params.push(limit, offset); }
    const [rows] = await db.query(sql, params);
    return rows;
  },

  async count(filters = {}) {
    const { clause, params } = this._buildFilter(filters);
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM bookings b ${clause}`, params);
    return rows[0].total;
  },

  async findById(id) {
    const [rows] = await db.query(`${SELECT_BASE} WHERE b.id = ? LIMIT 1`, [id]);
    return rows[0];
  },

  async findByCode(code) {
    const [rows] = await db.query(`${SELECT_BASE} WHERE b.code = ? LIMIT 1`, [code]);
    return rows[0];
  },

  async create(data) {
    const [r] = await db.query(
      `INSERT INTO bookings
       (code, user_id, room_type_id, room_id, guest_name, guest_phone, guest_email,
        check_in, check_out, nights, adults, children, room_price, room_total,
        services_total, discount, total_amount, promotion_id, status, payment_status,
        payment_method, special_request, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [data.code, data.user_id || null, data.room_type_id, data.room_id || null,
       data.guest_name, data.guest_phone, data.guest_email || null,
       data.check_in, data.check_out, data.nights, data.adults, data.children || 0,
       data.room_price, data.room_total, data.services_total || 0, data.discount || 0,
       data.total_amount, data.promotion_id || null, data.status || 'pending',
       data.payment_status || 'unpaid', data.payment_method || 'cash',
       data.special_request || null, data.created_by || null]
    );
    return r.insertId;
  },

  async updateStatus(id, status) {
    await db.query(`UPDATE bookings SET status=? WHERE id=?`, [status, id]);
  },

  async updatePayment(id, paymentStatus, method) {
    await db.query(
      `UPDATE bookings SET payment_status=?, payment_method=COALESCE(?, payment_method) WHERE id=?`,
      [paymentStatus, method || null, id]
    );
  },

  async assignRoom(id, roomId) {
    await db.query(`UPDATE bookings SET room_id=? WHERE id=?`, [roomId, id]);
  },

  // Kiểm tra 1 phòng có trống trong khoảng ngày không
  async isRoomAvailable(roomId, checkIn, checkOut, excludeBookingId = 0) {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS cnt FROM bookings
       WHERE room_id = ? AND id <> ?
         AND status IN ('confirmed','checked_in','pending')
         AND NOT (check_out <= ? OR check_in >= ?)`,
      [roomId, excludeBookingId, checkIn, checkOut]
    );
    return rows[0].cnt === 0;
  },

  // ---------- THỐNG KÊ ----------
  async countByStatus() {
    const [rows] = await db.query(`SELECT status, COUNT(*) AS total FROM bookings GROUP BY status`);
    const result = { pending: 0, confirmed: 0, checked_in: 0, checked_out: 0, cancelled: 0, total: 0 };
    rows.forEach((r) => { result[r.status] = r.total; result.total += r.total; });
    return result;
  },

  async totalRevenue() {
    const [rows] = await db.query(
      `SELECT COALESCE(SUM(total_amount),0) AS revenue FROM bookings
       WHERE payment_status='paid' OR status='checked_out'`
    );
    return Number(rows[0].revenue);
  },

  async revenueByMonth(year) {
    const [rows] = await db.query(
      `SELECT MONTH(check_in) AS month, COALESCE(SUM(total_amount),0) AS revenue, COUNT(*) AS bookings
       FROM bookings
       WHERE YEAR(check_in)=? AND status <> 'cancelled'
       GROUP BY MONTH(check_in) ORDER BY month`, [year]
    );
    // Lấp đầy 12 tháng
    const data = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, revenue: 0, bookings: 0 }));
    rows.forEach((r) => { data[r.month - 1] = { month: r.month, revenue: Number(r.revenue), bookings: r.bookings }; });
    return data;
  },

  async revenueBetween(from, to) {
    const [rows] = await db.query(
      `SELECT COALESCE(SUM(total_amount),0) AS revenue, COUNT(*) AS bookings
       FROM bookings WHERE check_in BETWEEN ? AND ? AND status <> 'cancelled'`,
      [from, to]
    );
    return { revenue: Number(rows[0].revenue), bookings: rows[0].bookings };
  },

  // Top loại phòng được đặt nhiều nhất
  async topRoomTypes(limit = 5) {
    const [rows] = await db.query(
      `SELECT rt.name, COUNT(*) AS bookings, COALESCE(SUM(b.total_amount),0) AS revenue
       FROM bookings b JOIN room_types rt ON b.room_type_id = rt.id
       WHERE b.status <> 'cancelled'
       GROUP BY rt.id ORDER BY bookings DESC LIMIT ?`, [limit]
    );
    return rows;
  },

  async recent(limit = 5) {
    const [rows] = await db.query(`${SELECT_BASE} ORDER BY b.created_at DESC LIMIT ?`, [limit]);
    return rows;
  },

  async revenueToday() {
    const [rows] = await db.query(
      `SELECT COALESCE(SUM(total_amount),0) AS revenue FROM bookings
       WHERE DATE(created_at)=CURDATE() AND status <> 'cancelled'`
    );
    return Number(rows[0].revenue);
  },
};

module.exports = BookingModel;
