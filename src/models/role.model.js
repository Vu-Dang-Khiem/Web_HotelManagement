const db = require('../config/db');

const RoleModel = {
  async findAll() {
    const [rows] = await db.query(`SELECT * FROM roles ORDER BY id`);
    return rows;
  },
  async findByName(name) {
    const [rows] = await db.query(`SELECT * FROM roles WHERE name=? LIMIT 1`, [name]);
    return rows[0];
  },
};

module.exports = RoleModel;
