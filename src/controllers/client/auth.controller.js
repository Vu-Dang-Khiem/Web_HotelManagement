const AuthService = require('../../services/auth.service');
const messages = require('../../constants/messages');
const roles = require('../../constants/roles');

module.exports = {
  showLogin(req, res) {
    res.render('client/auth/login', { title: 'Đăng nhập' });
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await AuthService.login(email, password);
      req.session.user = user;

      // Điều hướng theo vai trò
      const returnTo = req.session.returnTo;
      delete req.session.returnTo;
      req.flash('success', messages.LOGIN_SUCCESS);

      if (user.role === roles.ADMIN) return res.redirect('/admin');
      if (user.role === roles.STAFF) return res.redirect('/staff');
      return res.redirect(returnTo || '/');
    } catch (err) {
      req.flash('error', err.message);
      req.flash('formData', req.body);
      res.redirect('/login');
    }
  },

  showRegister(req, res) {
    res.render('client/auth/register', { title: 'Đăng ký' });
  },

  async register(req, res) {
    try {
      await AuthService.register(req.body);
      req.flash('success', messages.REGISTER_SUCCESS);
      res.redirect('/login');
    } catch (err) {
      req.flash('error', err.message);
      req.flash('formData', req.body);
      res.redirect('/register');
    }
  },

  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  },
};
