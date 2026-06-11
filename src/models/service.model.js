const db = require('../config/db');

const ServiceModel = {
  _buildFilter(filters = {}) {
    const where = [];
    const params = [];
    if (filters.search) { where.push('name LIKE ?'); params.push(`%${filters.search}%`); }
    if (filters.status) { where.push('status = ?'); params.push(filters.status); }
    return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
  },

  async findAll(filters = {}, limit = null, offset = 0) {
    const { clause, params } = this._buildFilter(filters);
    let sql = `SELECT * FROM services ${clause} ORDER BY created_at DESC`;
    if (limit !== null) { sql += ` LIMIT ? OFFSET ?`; params.push(limit, offset); }
    const [rows] = await db.query(sql, params);
    return rows;
  },

  async count(filters = {}) {
    const { clause, params } = this._buildFilter(filters);
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM services ${clause}`, params);
    return rows[0].total;
  },

  async findActive() {
    const [rows] = await db.query(`SELECT * FROM services WHERE status='active' ORDER BY id`);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(`SELECT * FROM services WHERE id=? LIMIT 1`, [id]);
    return rows[0];
  },

  async create(data) {
    const [r] = await db.query(
      `INSERT INTO services (name, description, price, unit, icon, status) VALUES (?,?,?,?,?,?)`,
      [data.name, data.description || null, data.price, data.unit || 'lần',
       data.icon || 'fa-solid fa-concierge-bell', data.status || 'active']
    );
    return r.insertId;
  },

  async update(id, data) {
    await db.query(
      `UPDATE services SET name=?, description=?, price=?, unit=?, icon=?, status=? WHERE id=?`,
      [data.name, data.description || null, data.price, data.unit, data.icon, data.status, id]
    );
  },

  async remove(id) {
    await db.query(`DELETE FROM services WHERE id=?`, [id]);
  },
};

module.exports = ServiceModel;
