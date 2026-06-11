const RoomTypeModel = require('../../models/roomType.model');
const RoomTypeService = require('../../services/roomType.service');
const AmenityModel = require('../../models/amenity.model');
const { buildPagination } = require('../../utils/pagination');
const appConfig = require('../../config/app.config');

module.exports = {
  // Danh sách loại phòng (có lọc giá, sức chứa, tìm kiếm, sắp xếp)
  async list(req, res, next) {
    try {
      const filters = { status: 'active' };
      if (req.query.search) filters.search = req.query.search;
      if (req.query.minPrice) filters.minPrice = req.query.minPrice;
      if (req.query.maxPrice) filters.maxPrice = req.query.maxPrice;
      if (req.query.capacity) filters.capacity = req.query.capacity;

      // Sắp xếp
      const sortMap = {
        newest: 'rt.created_at DESC',
        price_asc: 'rt.base_price ASC',
        price_desc: 'rt.base_price DESC',
        rating: 'avg_rating DESC',
      };
      const orderBy = sortMap[req.query.sort] || 'rt.created_at DESC';

      const pageSize = appConfig.clientPageSize;
      const total = await RoomTypeModel.count(filters);
      const pagination = buildPagination(total, req.query.page, pageSize, '/phong', req.query);
      const rooms = await RoomTypeModel.findAll(filters, pageSize, pagination.offset, orderBy);

      // Gắn tiện nghi rút gọn cho mỗi loại
      for (const r of rooms) {
        r.amenities = (await RoomTypeModel.getAmenities(r.id)).slice(0, 4);
      }

      res.render('client/rooms/list', {
        title: 'Danh sách phòng',
        rooms,
        pagination,
        query: req.query,
      });
    } catch (err) { next(err); }
  },

  // Chi tiết loại phòng
  async detail(req, res, next) {
    try {
      const room = await RoomTypeService.getDetailBySlug(req.params.slug);
      if (!room) {
        return res.status(404).render('errors/404', { title: 'Không tìm thấy phòng' });
      }
      // Phòng tương tự
      const related = await RoomTypeModel.findAll({ status: 'active' }, 3, 0, 'RAND()');
      res.render('client/rooms/detail', {
        title: room.name,
        room,
        related: related.filter((r) => r.id !== room.id).slice(0, 3),
      });
    } catch (err) { next(err); }
  },
};
