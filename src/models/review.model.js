const db = require('../config/db');

const ReviewModel = {
  async findByRoomType(typeId, onlyVisible = true) {
    const [rows] = await db.query(
      `SELECT rv.*, u.full_name, u.avatar
       FROM reviews rv JOIN users u ON rv.user_id = u.id
       WHERE rv.room_type_id = ? ${onlyVisible ? "AND rv.status='visible'" : ''}
       ORDER BY rv.created_at DESC`, [typeId]
    );
    return rows;
  },

  // Đánh giá nổi bật cho trang chủ
  async featured(limit = 6) {
    const [rows] = await db.query(
      `SELECT rv.*, u.full_name, u.avatar, rt.name AS type_name
       FROM reviews rv
       JOIN users u ON rv.user_id = u.id
       JOIN room_types rt ON rv.room_type_id = rt.id
       WHERE rv.status='visible' AND rv.rating >= 4
       ORDER BY rv.created_at DESC LIMIT ?`, [limit]
    );
    return rows;
  },

  _buildFilter(filters = {}) {
    const where = [];
    const params = [];
    if (filters.status) { where.push('rv.status = ?'); params.push(filters.status); }
    if (filters.rating) { where.push('rv.rating = ?'); params.push(filters.rating); }
    if (filters.typeId) { where.push('rv.room_type_id = ?'); params.push(filters.typeId); }
    return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
  },

  async findAll(filters = {}, limit = null, offset = 0) {
    const { clause, params } = this._buildFilter(filters);
    let sql = `SELECT rv.*, u.full_name, rt.name AS type_name
               FROM reviews rv
               JOIN users u ON rv.user_id = u.id
               JOIN room_types rt ON rv.room_type_id = rt.id
               ${clause} ORDER BY rv.created_at DESC`;
    if (limit !== null) { sql += ` LIMIT ? OFFSET ?`; params.push(limit, offset); }
    const [rows] = await db.query(sql, params);
    return rows;
  },

  async count(filters = {}) {
    const { clause, params } = this._buildFilter(filters);
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM reviews rv ${clause}`, params);
    return rows[0].total;
  },

  async findById(id) {
    const [rows] = await db.query(`SELECT * FROM reviews WHERE id=? LIMIT 1`, [id]);
    return rows[0];
  },

  async create(data) {
    const [r] = await db.query(
      `INSERT INTO reviews (user_id, room_type_id, booking_id, rating, comment) VALUES (?,?,?,?,?)`,
      [data.user_id, data.room_type_id, data.booking_id || null, data.rating, data.comment || null]
    );
    return r.insertId;
  },

  async updateStatus(id, status) {
    await db.query(`UPDATE reviews SET status=? WHERE id=?`, [status, id]);
  },

  async remove(id) {
    await db.query(`DELETE FROM reviews WHERE id=?`, [id]);
  },

  async avgRating() {
    const [rows] = await db.query(
      `SELECT ROUND(AVG(rating),1) AS avg, COUNT(*) AS total FROM reviews WHERE status='visible'`
    );
    return rows[0];
  },
};

module.exports = ReviewModel;
