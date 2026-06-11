const RoomModel = require('../../models/room.model');
const RoomTypeModel = require('../../models/roomType.model');
const { buildPagination } = require('../../utils/pagination');
const { toInt } = require('../../utils/helpers');
const appConfig = require('../../config/app.config');
const messages = require('../../constants/messages');

module.exports = {
  async index(req, res, next) {
    try {
      const filters = {};
      if (req.query.search) filters.search = req.query.search;
      if (req.query.status) filters.status = req.query.status;
      if (req.query.typeId) filters.typeId = req.query.typeId;
      if (req.query.floor) filters.floor = req.query.floor;
      const pageSize = appConfig.pageSize;
      const total = await RoomModel.count(filters);
      const pagination = buildPagination(total, req.query.page, pageSize, '/admin/phong', req.query);
      const [rooms, roomTypes, floors] = await Promise.all([
        RoomModel.findAll(filters, pageSize, pagination.offset),
        RoomTypeModel.findAll({}),
        RoomModel.getFloors(),
      ]);
      res.render('admin/rooms/list', {
        title: 'Quản lý phòng', rooms, roomTypes, floors, pagination, query: req.query,
      });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const roomTypes = await RoomTypeModel.findAll({});
      res.render('admin/rooms/form', { title: 'Thêm phòng', room: null, roomTypes });
    } catch (err) { next(err); }
  },

  async store(req, res, next) {
    try {
      await RoomModel.create({
        room_type_id: req.body.room_type_id,
        room_number: req.body.room_number,
        floor: toInt(req.body.floor) || null,
        status: req.body.status || 'available',
        note: req.body.note,
      });
      req.flash('success', messages.CREATE_SUCCESS);
      res.redirect('/admin/phong');
    } catch (err) {
      req.flash('error', 'Số phòng có thể đã tồn tại.');
      res.redirect('/admin/phong/them');
    }
  },

  async edit(req, res, next) {
    try {
      const [room, roomTypes] = await Promise.all([
        RoomModel.findById(req.params.id), RoomTypeModel.findAll({}),
      ]);
      if (!room) { req.flash('error', messages.NOT_FOUND); return res.redirect('/admin/phong'); }
      res.render('admin/rooms/form', { title: 'Sửa phòng', room, roomTypes });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      await RoomModel.update(req.params.id, {
        room_type_id: req.body.room_type_id,
        room_number: req.body.room_number,
        floor: toInt(req.body.floor) || null,
        status: req.body.status,
        note: req.body.note,
      });
      req.flash('success', messages.UPDATE_SUCCESS);
      res.redirect('/admin/phong');
    } catch (err) {
      req.flash('error', 'Số phòng có thể đã tồn tại.');
      res.redirect(`/admin/phong/${req.params.id}/sua`);
    }
  },

  async destroy(req, res) {
    try {
      await RoomModel.remove(req.params.id);
      req.flash('success', messages.DELETE_SUCCESS);
    } catch (err) {
      req.flash('error', 'Không thể xóa phòng đang có đơn đặt.');
    }
    res.redirect('/admin/phong');
  },
};
