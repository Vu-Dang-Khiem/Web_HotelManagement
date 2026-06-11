const UserModel = require('../../models/user.model');
const RoleModel = require('../../models/role.model');
const { hashPassword } = require('../../utils/hash');
const { buildPagination } = require('../../utils/pagination');
const appConfig = require('../../config/app.config');
const messages = require('../../constants/messages');

module.exports = {
  async index(req, res, next) {
    try {
      const filters = {};
      if (req.query.search) filters.search = req.query.search;
      if (req.query.role) filters.role = req.query.role;
      if (req.query.status) filters.status = req.query.status;
      const pageSize = appConfig.pageSize;
      const total = await UserModel.count(filters);
      const pagination = buildPagination(total, req.query.page, pageSize, '/admin/nguoi-dung', req.query);
      const [users, roles] = await Promise.all([
        UserModel.findAll(filters, pageSize, pagination.offset),
        RoleModel.findAll(),
      ]);
      res.render('admin/users/list', { title: 'Quản lý người dùng', users, roles, pagination, query: req.query });
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const roles = await RoleModel.findAll();
      res.render('admin/users/form', { title: 'Thêm người dùng', user: null, roles });
    } catch (err) { next(err); }
  },

  async store(req, res) {
    try {
      const existing = await UserModel.findByEmail(req.body.email);
      if (existing) throw new Error(messages.EMAIL_EXISTS);
      if (req.body.phone) {
        const phoneExists = await UserModel.findByPhone(req.body.phone);
        if (phoneExists) throw new Error(messages.PHONE_EXISTS);
      }
      const hashed = await hashPassword(req.body.password || '123456');
      await UserModel.create({
        role_id: req.body.role_id,
        full_name: req.body.full_name,
        email: req.body.email,
        password: hashed,
        phone: req.body.phone,
        address: req.body.address,
        status: req.body.status || 'active',
      });
      req.flash('success', messages.CREATE_SUCCESS);
      res.redirect('/admin/nguoi-dung');
    } catch (err) {
      req.flash('error', err.message);
      req.flash('formData', req.body);
      res.redirect('/admin/nguoi-dung/them');
    }
  },

  async edit(req, res, next) {
    try {
      const [user, roles] = await Promise.all([
        UserModel.findById(req.params.id), RoleModel.findAll(),
      ]);
      if (!user) { req.flash('error', messages.NOT_FOUND); return res.redirect('/admin/nguoi-dung'); }
      res.render('admin/users/form', { title: 'Sửa người dùng', user, roles });
    } catch (err) { next(err); }
  },

  async update(req, res) {
    try {
      if (req.body.phone) {
        const phoneExists = await UserModel.findByPhone(req.body.phone, req.params.id);
        if (phoneExists) throw new Error(messages.PHONE_EXISTS);
      }
      await UserModel.adminUpdate(req.params.id, {
        full_name: req.body.full_name,
        phone: req.body.phone,
        address: req.body.address,
        role_id: req.body.role_id,
        status: req.body.status,
      });
      if (req.body.password) {
        await UserModel.updatePassword(req.params.id, await hashPassword(req.body.password));
      }
      req.flash('success', messages.UPDATE_SUCCESS);
      res.redirect('/admin/nguoi-dung');
    } catch (err) {
      req.flash('error', err.message);
      req.flash('formData', req.body);
      res.redirect(`/admin/nguoi-dung/${req.params.id}/sua`);
    }
  },

  async toggleStatus(req, res) {
    try {
      const user = await UserModel.findById(req.params.id);
      const newStatus = user.status === 'active' ? 'locked' : 'active';
      await UserModel.updateStatus(req.params.id, newStatus);
      req.flash('success', `Đã ${newStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản.`);
    } catch (err) { req.flash('error', messages.SERVER_ERROR); }
    res.redirect('/admin/nguoi-dung');
  },

  async destroy(req, res) {
    try {
      if (Number(req.params.id) === req.session.user.id) {
        throw new Error('Không thể xóa chính tài khoản đang đăng nhập.');
      }
      await UserModel.remove(req.params.id);
      req.flash('success', messages.DELETE_SUCCESS);
    } catch (err) { req.flash('error', err.message); }
    res.redirect('/admin/nguoi-dung');
  },
};
