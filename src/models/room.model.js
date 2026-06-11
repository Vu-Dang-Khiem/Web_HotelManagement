const db = require('../config/db');

const RoomModel = {
  _buildFilter(filters = {}) {
    const where = [];
    const params = [];
    if (filters.search) { where.push('r.room_number LIKE ?'); params.push(`%${filters.search}%`); }
    if (filters.typeId) { where.push('r.room_type_id = ?'); params.push(filters.typeId); }
    if (filters.status) { where.push('r.status = ?'); params.push(filters.status); }
    if (filters.floor) { where.push('r.floor = ?'); params.push(filters.floor); }
    return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
  },

  async findAll(filters = {}, limit = null, offset = 0) {
    const { clause, params } = this._buildFilter(filters);
    let sql = `SELECT r.*, rt.name AS type_name, rt.base_price
               FROM rooms r JOIN room_types rt ON r.room_type_id = rt.id
               ${clause} ORDER BY r.floor, r.room_number`;
    if (limit !== null) { sql += ` LIMIT ? OFFSET ?`; params.push(limit, offset); }
    const [rows] = await db.query(sql, params);
    return rows;
  },

  async count(filters = {}) {
    const { clause, params } = this._buildFilter(filters);
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM rooms r ${clause}`, params);
    return rows[0].total;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT r.*, rt.name AS type_name, rt.base_price
       FROM rooms r JOIN room_types rt ON r.room_type_id = rt.id
       WHERE r.id=? LIMIT 1`, [id]
    );
    return rows[0];
  },

  async create(data) {
    const [r] = await db.query(
      `INSERT INTO rooms (room_type_id, room_number, floor, status, note) VALUES (?,?,?,?,?)`,
      [data.room_type_id, data.room_number, data.floor || null, data.status || 'available', data.note || null]
    );
    return r.insertId;
  },

  async update(id, data) {
    await db.query(
      `UPDATE rooms SET room_type_id=?, room_number=?, floor=?, status=?, note=? WHERE id=?`,
      [data.room_type_id, data.room_number, data.floor || null, data.status, data.note || null, id]
    );
  },

  async updateStatus(id, status) {
    await db.query(`UPDATE rooms SET status=? WHERE id=?`, [status, id]);
  },

  async remove(id) {
    await db.query(`DELETE FROM rooms WHERE id=?`, [id]);
  },

  // Tìm các phòng còn trống của 1 loại trong khoảng ngày (không trùng đơn đang hiệu lực)
  async findAvailable(typeId, checkIn, checkOut, excludeBookingId = 0) {
    const [rows] = await db.query(
      `SELECT r.* FROM rooms r
       WHERE r.room_type_id = ?
         AND r.status <> 'maintenance'
         AND r.id NOT IN (
           SELECT b.room_id FROM bookings b
           WHERE b.room_id IS NOT NULL
             AND b.id <> ?
             AND b.status IN ('confirmed','checked_in','pending')
             AND NOT (b.check_out <= ? OR b.check_in >= ?)
         )
       ORDER BY r.room_number`,
      [typeId, excludeBookingId, checkIn, checkOut]
    );
    return rows;
  },

  // Đếm phòng theo trạng thái (cho dashboard)
  async countByStatus() {
    const [rows] = await db.query(
      `SELECT status, COUNT(*) AS total FROM rooms GROUP BY status`
    );
    const result = { available: 0, occupied: 0, maintenance: 0, total: 0 };
    rows.forEach((r) => { result[r.status] = r.total; result.total += r.total; });
    return result;
  },

  async getFloors() {
    const [rows] = await db.query(`SELECT DISTINCT floor FROM rooms WHERE floor IS NOT NULL ORDER BY floor`);
    return rows.map((r) => r.floor);
  },
};

module.exports = RoomModel;
