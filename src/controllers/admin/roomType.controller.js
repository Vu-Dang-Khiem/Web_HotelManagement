const RoomTypeModel = require('../../models/roomType.model');
const RoomTypeService = require('../../services/roomType.service');
const AmenityModel = require('../../models/amenity.model');
const { buildPagination } = require('../../utils/pagination');
const { toInt } = require('../../utils/helpers');
const appConfig = require('../../config/app.config');
const messages = require('../../constants/messages');

// Chuẩn hóa dữ liệu từ form
function pick(body) {
  return {
    name: body.name,
    description: body.description,
    base_price: toInt(body.base_price),
    capacity: toInt(body.capacity, 2),
    area: toInt(body.area) || null,
    bed_type: body.bed_type,
    view_type: body.view_type,
    thumbnail: body.thumbnail,
    status: body.status || 'active',
  };
}

function getAmenityIds(body) {
  if (!body.amenities) return [];
  return Array.isArray(body.amenities) ? body.amenities : [body.amenities];
}

module.exports = {
  async index(req, res, next) {
    try {
      const filters = {};
      if (req.query.search) filters.search = req.query.search;
      if (req.query.status) filters.status = req.query.status;
      const pageSize = appConfig.pageSize;
      const total = await RoomTypeModel.count(filters);
      const pagination = buildPagination(total, req.query.page, pageSize, '/admin/loai-phong', req.query);
      const roomTypes = await RoomTypeModel.findAll(filters, pageSize, pagination.offset);
      res.render('admin/roomTypes/list', {
        title: 'Quản lý loại phòng', roomTypes, pagination, query: req.query,
      });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const amenities = await AmenityModel.findAll();
      res.render('admin/roomTypes/form', {
        title: 'Thêm loại phòng', roomType: null, amenities, selectedAmenities: [],
      });
    } catch (err) { next(err); }
  },

  async store(req, res, next) {
    try {
      const data = pick(req.body);
      if (req.file) data.thumbnail = `/uploads/${req.file.filename}`;
      const id = await RoomTypeService.create(data, getAmenityIds(req.body));
      // ảnh gallery
      if (req.body.gallery) {
        const urls = req.body.gallery.split('\n').map((u) => u.trim()).filter(Boolean);
        for (let i = 0; i < urls.length; i++) await RoomTypeModel.addImage(id, urls[i], i);
      }
      req.flash('success', messages.CREATE_SUCCESS);
      res.redirect('/admin/loai-phong');
    } catch (err) { next(err); }
  },

  async edit(req, res, next) {
    try {
      const roomType = await RoomTypeService.getDetailById(req.params.id);
      if (!roomType) { req.flash('error', messages.NOT_FOUND); return res.redirect('/admin/loai-phong'); }
      const amenities = await AmenityModel.findAll();
      res.render('admin/roomTypes/form', {
        title: 'Sửa loại phòng', roomType, amenities, selectedAmenities: roomType.amenityIds,
      });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const data = pick(req.body);
      if (req.file) data.thumbnail = `/uploads/${req.file.filename}`;
      await RoomTypeService.update(req.params.id, data, getAmenityIds(req.body));
      req.flash('success', messages.UPDATE_SUCCESS);
      res.redirect('/admin/loai-phong');
    } catch (err) { next(err); }
  },

  async destroy(req, res) {
    try {
      await RoomTypeModel.remove(req.params.id);
      req.flash('success', messages.DELETE_SUCCESS);
    } catch (err) {
      req.flash('error', 'Không thể xóa loại phòng đang có phòng/đơn đặt liên quan.');
    }
    res.redirect('/admin/loai-phong');
  },

  // Xóa 1 ảnh gallery
  async removeImage(req, res) {
    try {
      await RoomTypeModel.removeImage(req.params.imageId);
      req.flash('success', messages.DELETE_SUCCESS);
    } catch (err) { req.flash('error', messages.SERVER_ERROR); }
    res.redirect(`/admin/loai-phong/${req.params.id}/sua`);
  },
};
