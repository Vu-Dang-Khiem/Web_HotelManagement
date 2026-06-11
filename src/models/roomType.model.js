const db = require('../config/db');

const RoomTypeModel = {
  _buildFilter(filters = {}) {
    const where = [];
    const params = [];
    if (filters.search) {
      where.push('(rt.name LIKE ? OR rt.description LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.status) { where.push('rt.status = ?'); params.push(filters.status); }
    if (filters.minPrice) { where.push('rt.base_price >= ?'); params.push(filters.minPrice); }
    if (filters.maxPrice) { where.push('rt.base_price <= ?'); params.push(filters.maxPrice); }
    if (filters.capacity) { where.push('rt.capacity >= ?'); params.push(filters.capacity); }
    return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', params };
  },

  // Danh sách loại phòng kèm số phòng, đánh giá trung bình — dùng cho admin & client
  async findAll(filters = {}, limit = null, offset = 0, orderBy = 'rt.created_at DESC') {
    const { clause, params } = this._buildFilter(filters);
    let sql = `
      SELECT rt.*,
        (SELECT COUNT(*) FROM rooms r WHERE r.room_type_id = rt.id) AS total_rooms,
        (SELECT COUNT(*) FROM rooms r WHERE r.room_type_id = rt.id AND r.status='available') AS available_rooms,
        (SELECT ROUND(AVG(rv.rating),1) FROM reviews rv WHERE rv.room_type_id = rt.id AND rv.status='visible') AS avg_rating,
        (SELECT COUNT(*) FROM reviews rv WHERE rv.room_type_id = rt.id AND rv.status='visible') AS review_count
      FROM room_types rt
      ${clause}
      ORDER BY ${orderBy}`;
    if (limit !== null) { sql += ` LIMIT ? OFFSET ?`; params.push(limit, offset); }
    const [rows] = await db.query(sql, params);
    return rows;
  },

  async count(filters = {}) {
    const { clause, params } = this._buildFilter(filters);
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM room_types rt ${clause}`, params);
    return rows[0].total;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT rt.*,
        (SELECT COUNT(*) FROM rooms r WHERE r.room_type_id = rt.id) AS total_rooms,
        (SELECT COUNT(*) FROM rooms r WHERE r.room_type_id = rt.id AND r.status='available') AS available_rooms,
        (SELECT ROUND(AVG(rv.rating),1) FROM reviews rv WHERE rv.room_type_id = rt.id AND rv.status='visible') AS avg_rating,
        (SELECT COUNT(*) FROM reviews rv WHERE rv.room_type_id = rt.id AND rv.status='visible') AS review_count
       FROM room_types rt WHERE rt.id = ? LIMIT 1`, [id]
    );
    return rows[0];
  },

  async findBySlug(slug) {
    const [rows] = await db.query(`SELECT * FROM room_types WHERE slug=? LIMIT 1`, [slug]);
    return rows[0];
  },

  async create(data) {
    const [result] = await db.query(
      `INSERT INTO room_types (name, slug, description, base_price, capacity, area, bed_type, view_type, thumbnail, status)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [data.name, data.slug, data.description || null, data.base_price, data.capacity,
       data.area || null, data.bed_type || null, data.view_type || null,
       data.thumbnail || null, data.status || 'active']
    );
    return result.insertId;
  },

  async update(id, data) {
    await db.query(
      `UPDATE room_types SET name=?, slug=?, description=?, base_price=?, capacity=?,
        area=?, bed_type=?, view_type=?, thumbnail=?, status=? WHERE id=?`,
      [data.name, data.slug, data.description || null, data.base_price, data.capacity,
       data.area || null, data.bed_type || null, data.view_type || null,
       data.thumbnail || null, data.status, id]
    );
  },

  async remove(id) {
    await db.query(`DELETE FROM room_types WHERE id=?`, [id]);
  },

  // ----- Tiện nghi -----
  async getAmenities(typeId) {
    const [rows] = await db.query(
      `SELECT a.* FROM amenities a
       JOIN room_type_amenities rta ON a.id = rta.amenity_id
       WHERE rta.room_type_id = ? ORDER BY a.id`, [typeId]
    );
    return rows;
  },

  async setAmenities(typeId, amenityIds = []) {
    await db.query(`DELETE FROM room_type_amenities WHERE room_type_id=?`, [typeId]);
    if (amenityIds.length) {
      const rows = amenityIds.map((aid) => [typeId, aid]);
      await db.query(`INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES ?`, [rows]);
    }
  },

  // ----- Ảnh -----
  async getImages(typeId) {
    const [rows] = await db.query(
      `SELECT * FROM room_type_images WHERE room_type_id=? ORDER BY sort_order, id`, [typeId]
    );
    return rows;
  },

  async addImage(typeId, url, sort = 0) {
    await db.query(
      `INSERT INTO room_type_images (room_type_id, image_url, sort_order) VALUES (?,?,?)`,
      [typeId, url, sort]
    );
  },

  async removeImage(imageId) {
    await db.query(`DELETE FROM room_type_images WHERE id=?`, [imageId]);
  },

  async countActive() {
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM room_types WHERE status='active'`);
    return rows[0].total;
  },
};

module.exports = RoomTypeModel;
