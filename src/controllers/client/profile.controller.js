const UserModel = require('../../models/user.model');
const AuthService = require('../../services/auth.service');
const ReviewModel = require('../../models/review.model');
const BookingModel = require('../../models/booking.model');
const messages = require('../../constants/messages');

module.exports = {
  // Trang hồ sơ
  async show(req, res, next) {
    try {
      const user = await UserModel.findById(req.session.user.id);
      const bookingCount = await BookingModel.count({ userId: user.id });
      res.render('client/profile/index', { title: 'Hồ sơ của tôi', user, bookingCount });
    } catch (err) { next(err); }
  },

  // Cập nhật thông tin
  async update(req, res, next) {
    try {
      const data = {
        full_name: req.body.full_name,
        phone: req.body.phone,
        address: req.body.address,
        avatar: req.file ? `/uploads/${req.file.filename}` : (req.body.current_avatar || null),
      };
      await UserModel.update(req.session.user.id, data);
      // cập nhật session
      req.session.user.full_name = data.full_name;
      req.session.user.phone = data.phone;
      if (req.file) req.session.user.avatar = data.avatar;
      req.flash('success', messages.PROFILE_UPDATED);
      res.redirect('/tai-khoan');
    } catch (err) { next(err); }
  },

  // Đổi mật khẩu
  async changePassword(req, res) {
    try {
      const { current_password, new_password, confirm_password } = req.body;
      if (new_password !== confirm_password) {
        throw new Error('Xác nhận mật khẩu không khớp.');
      }
      if (!new_password || new_password.length < 6) {
        throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      }
      await AuthService.changePassword(req.session.user.id, current_password, new_password);
      req.flash('success', messages.PASSWORD_CHANGED);
    } catch (err) {
      req.flash('error', err.message);
    }
    res.redirect('/tai-khoan');
  },

  // Gửi đánh giá (sau khi đã trả phòng)
  async submitReview(req, res) {
    try {
      const booking = await BookingModel.findById(req.body.booking_id);
      if (!booking || booking.user_id !== req.session.user.id) {
        throw new Error(messages.ACCESS_DENIED);
      }
      await ReviewModel.create({
        user_id: req.session.user.id,
        room_type_id: booking.room_type_id,
        booking_id: booking.id,
        rating: parseInt(req.body.rating, 10) || 5,
        comment: req.body.comment,
      });
      req.flash('success', messages.REVIEW_SUCCESS);
    } catch (err) {
      req.flash('error', err.message);
    }
    res.redirect('/tai-khoan/don-dat');
  },
};
