const db = require('../config/db');

const PromotionModel = {
  _buildFilter(filters = {}) {
    const where = [];
    const params = [];
    if (filters.search) {
      where.push('(code LIKE ? OR name LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.status) { where.push('status = ?'); params.push(filters.status); }
    return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
  },

  async findAll(filters = {}, limit = null, offset = 0) {
    const { clause, params } = this._buildFilter(filters);
    let sql = `SELECT * FROM promotions ${clause} ORDER BY created_at DESC`;
    if (limit !== null) { sql += ` LIMIT ? OFFSET ?`; params.push(limit, offset); }
    const [rows] = await db.query(sql, params);
    return rows;
  },

  async count(filters = {}) {
    const { clause, params } = this._buildFilter(filters);
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM promotions ${clause}`, params);
    return rows[0].total;
  },

  async findById(id) {
    const [rows] = await db.query(`SELECT * FROM promotions WHERE id=? LIMIT 1`, [id]);
    return rows[0];
  },

  // Mã giảm giá còn hiệu lực (active + trong thời gian)
  async findValidByCode(code) {
    const [rows] = await db.query(
      `SELECT * FROM promotions
       WHERE code = ? AND status='active'
         AND (start_date IS NULL OR start_date <= CURDATE())
         AND (end_date IS NULL OR end_date >= CURDATE())
       LIMIT 1`, [code]
    );
    return rows[0];
  },

  async findActive() {
    const [rows] = await db.query(
      `SELECT * FROM promotions WHERE status='active'
       AND (end_date IS NULL OR end_date >= CURDATE()) ORDER BY created_at DESC`
    );
    return rows;
  },

  async create(data) {
    const [r] = await db.query(
      `INSERT INTO promotions (code, name, description, discount_type, discount_value, min_total, start_date, end_date, status)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [data.code, data.name, data.description || null, data.discount_type, data.discount_value,
       data.min_total || 0, data.start_date || null, data.end_date || null, data.status || 'active']
    );
    return r.insertId;
  },

  async update(id, data) {
    await db.query(
      `UPDATE promotions SET code=?, name=?, description=?, discount_type=?, discount_value=?,
        min_total=?, start_date=?, end_date=?, status=? WHERE id=?`,
      [data.code, data.name, data.description || null, data.discount_type, data.discount_value,
       data.min_total || 0, data.start_date || null, data.end_date || null, data.status, id]
    );
  },

  async remove(id) {
    await db.query(`DELETE FROM promotions WHERE id=?`, [id]);
  },
};

module.exports = PromotionModel;
