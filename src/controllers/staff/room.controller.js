const RoomModel = require('../../models/room.model');
const RoomTypeModel = require('../../models/roomType.model');
const messages = require('../../constants/messages');

module.exports = {
  // Sơ đồ trạng thái phòng
  async index(req, res, next) {
    try {
      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.typeId) filters.typeId = req.query.typeId;
      if (req.query.floor) filters.floor = req.query.floor;
      const [rooms, roomTypes, floors, stats] = await Promise.all([
        RoomModel.findAll(filters),
        RoomTypeModel.findAll({}),
        RoomModel.getFloors(),
        RoomModel.countByStatus(),
      ]);
      res.render('staff/rooms/index', {
        title: 'Sơ đồ phòng', rooms, roomTypes, floors, stats, query: req.query,
      });
    } catch (err) { next(err); }
  },

  async updateStatus(req, res) {
    try {
      await RoomModel.updateStatus(req.params.id, req.body.status);
      req.flash('success', messages.UPDATE_SUCCESS);
    } catch (err) { req.flash('error', messages.SERVER_ERROR); }
    res.redirect('/staff/phong');
  },
};
