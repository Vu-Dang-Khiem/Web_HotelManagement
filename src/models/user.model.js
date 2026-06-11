const db = require('../config/db');

const UserModel = {
  async findByEmail(email) {
    const [rows] = await db.query(
      `SELECT u.*, r.name AS role_name
       FROM users u JOIN roles r ON u.role_id = r.id
       WHERE u.email = ? LIMIT 1`,
      [email]
    );
    return rows[0];
  },

  // Tìm theo số điện thoại (dùng để chặn trùng). excludeId: bỏ qua chính user đang sửa.
  async findByPhone(phone, excludeId = null) {
    if (!phone) return null;
    let sql = `SELECT id, full_name, email, phone FROM users WHERE phone = ?`;
    const params = [phone];
    if (excludeId) { sql += ` AND id <> ?`; params.push(excludeId); }
    sql += ` LIMIT 1`;
    const [rows] = await db.query(sql, params);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT u.*, r.name AS role_name
       FROM users u JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? LIMIT 1`,
      [id]
    );
    return rows[0];
  },

  async create(data) {
    const [result] = await db.query(
      `INSERT INTO users (role_id, full_name, email, password, phone, address, status)
       VALUES (?,?,?,?,?,?,?)`,
      [data.role_id, data.full_name, data.email, data.password,
       data.phone || null, data.address || null, data.status || 'active']
    );
    return result.insertId;
  },

  async update(id, data) {
    await db.query(
      `UPDATE users SET full_name=?, phone=?, address=?, avatar=? WHERE id=?`,
      [data.full_name, data.phone || null, data.address || null, data.avatar || null, id]
    );
  },

  async adminUpdate(id, data) {
    await db.query(
      `UPDATE users SET full_name=?, phone=?, address=?, role_id=?, status=? WHERE id=?`,
      [data.full_name, data.phone || null, data.address || null, data.role_id, data.status, id]
    );
  },

  async updatePassword(id, hashed) {
    await db.query(`UPDATE users SET password=? WHERE id=?`, [hashed, id]);
  },

  async updateStatus(id, status) {
    await db.query(`UPDATE users SET status=? WHERE id=?`, [status, id]);
  },

  async remove(id) {
    await db.query(`DELETE FROM users WHERE id=?`, [id]);
  },

  _buildFilter(filters = {}) {
    const where = [];
    const params = [];
    if (filters.search) {
      where.push('(u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.role) { where.push('r.name = ?'); params.push(filters.role); }
    if (filters.status) { where.push('u.status = ?'); params.push(filters.status); }
    return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
  },

  async findAll(filters = {}, limit = 10, offset = 0) {
    const { clause, params } = this._buildFilter(filters);
    const [rows] = await db.query(
      `SELECT u.*, r.name AS role_name FROM users u
       JOIN roles r ON u.role_id = r.id
       ${clause} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    return rows;
  },

  async count(filters = {}) {
    const { clause, params } = this._buildFilter(filters);
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total FROM users u
       JOIN roles r ON u.role_id = r.id ${clause}`,
      params
    );
    return rows[0].total;
  },

  async countClients() {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS total FROM users u JOIN roles r ON u.role_id=r.id WHERE r.name='client'`
    );
    return rows[0].total;
  },
};

module.exports = UserModel;
