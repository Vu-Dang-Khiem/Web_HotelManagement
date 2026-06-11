const AmenityModel = require('../../models/amenity.model');
const messages = require('../../constants/messages');

module.exports = {
  async index(req, res, next) {
    try {
      const amenities = await AmenityModel.findAll();
      res.render('admin/amenities/list', { title: 'Quản lý tiện nghi', amenities });
    } catch (err) { next(err); }
  },

  async store(req, res) {
    try {
      await AmenityModel.create({ name: req.body.name, icon: req.body.icon });
      req.flash('success', messages.CREATE_SUCCESS);
    } catch (err) { req.flash('error', messages.SERVER_ERROR); }
    res.redirect('/admin/tien-nghi');
  },

  async update(req, res) {
    try {
      await AmenityModel.update(req.params.id, { name: req.body.name, icon: req.body.icon });
      req.flash('success', messages.UPDATE_SUCCESS);
    } catch (err) { req.flash('error', messages.SERVER_ERROR); }
    res.redirect('/admin/tien-nghi');
  },

  async destroy(req, res) {
    try {
      await AmenityModel.remove(req.params.id);
      req.flash('success', messages.DELETE_SUCCESS);
    } catch (err) { req.flash('error', messages.SERVER_ERROR); }
    res.redirect('/admin/tien-nghi');
  },
};
