const db = require('../config/db');

const ContactModel = {
  _buildFilter(filters = {}) {
    const where = [];
    const params = [];
    if (filters.search) {
      where.push('(name LIKE ? OR email LIKE ? OR subject LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.status) { where.push('status = ?'); params.push(filters.status); }
    return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
  },

  async findAll(filters = {}, limit = null, offset = 0) {
    const { clause, params } = this._buildFilter(filters);
    let sql = `SELECT * FROM contacts ${clause} ORDER BY created_at DESC`;
    if (limit !== null) { sql += ` LIMIT ? OFFSET ?`; params.push(limit, offset); }
    const [rows] = await db.query(sql, params);
    return rows;
  },

  async count(filters = {}) {
    const { clause, params } = this._buildFilter(filters);
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM contacts ${clause}`, params);
    return rows[0].total;
  },

  async countNew() {
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM contacts WHERE status='new'`);
    return rows[0].total;
  },

  async findById(id) {
    const [rows] = await db.query(`SELECT * FROM contacts WHERE id=? LIMIT 1`, [id]);
    return rows[0];
  },

  async create(data) {
    const [r] = await db.query(
      `INSERT INTO contacts (name, email, phone, subject, message) VALUES (?,?,?,?,?)`,
      [data.name, data.email, data.phone || null, data.subject || null, data.message]
    );
    return r.insertId;
  },

  async updateStatus(id, status) {
    await db.query(`UPDATE contacts SET status=? WHERE id=?`, [status, id]);
  },

  async remove(id) {
    await db.query(`DELETE FROM contacts WHERE id=?`, [id]);
  },
};

module.exports = ContactModel;
