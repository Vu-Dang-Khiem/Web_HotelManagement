const db = require('../config/db');

const AmenityModel = {
  async findAll() {
    const [rows] = await db.query(`SELECT * FROM amenities ORDER BY id`);
    return rows;
  },
  async findById(id) {
    const [rows] = await db.query(`SELECT * FROM amenities WHERE id=? LIMIT 1`, [id]);
    return rows[0];
  },
  async create(data) {
    const [r] = await db.query(`INSERT INTO amenities (name, icon) VALUES (?,?)`,
      [data.name, data.icon || 'fa-solid fa-check']);
    return r.insertId;
  },
  async update(id, data) {
    await db.query(`UPDATE amenities SET name=?, icon=? WHERE id=?`, [data.name, data.icon, id]);
  },
  async remove(id) {
    await db.query(`DELETE FROM amenities WHERE id=?`, [id]);
  },
};

module.exports = AmenityModel;
