const RoomTypeModel = require('../../models/roomType.model');
const ServiceModel = require('../../models/service.model');
const ReviewModel = require('../../models/review.model');
const PromotionModel = require('../../models/promotion.model');
const ContactModel = require('../../models/contact.model');
const MailService = require('../../services/mail.service');
const messages = require('../../constants/messages');

module.exports = {
  // Trang chủ
  async index(req, res, next) {
    try {
      const [featuredRooms, services, reviews, promotions, ratingStats] = await Promise.all([
        RoomTypeModel.findAll({ status: 'active' }, 4, 0, 'rt.base_price DESC'),
        ServiceModel.findActive(),
        ReviewModel.featured(6),
        PromotionModel.findActive(),
        ReviewModel.avgRating(),
      ]);
      res.render('client/home', {
        title: 'Trang chủ',
        featuredRooms,
        services: services.slice(0, 6),
        reviews,
        promotions: promotions.slice(0, 3),
        ratingStats,
      });
    } catch (err) { next(err); }
  },

  // Giới thiệu
  about(req, res) {
    res.render('client/about', { title: 'Về chúng tôi' });
  },

  // Trang dịch vụ
  async services(req, res, next) {
    try {
      const services = await ServiceModel.findActive();
      res.render('client/services', { title: 'Dịch vụ', services });
    } catch (err) { next(err); }
  },

  // Trang khuyến mãi
  async promotions(req, res, next) {
    try {
      const promotions = await PromotionModel.findActive();
      res.render('client/promotions', { title: 'Khuyến mãi', promotions });
    } catch (err) { next(err); }
  },

  // Trang liên hệ
  contact(req, res) {
    res.render('client/contact', { title: 'Liên hệ' });
  },

  async submitContact(req, res, next) {
    try {
      await ContactModel.create(req.body);          // 1) Luôn lưu vào DB
      MailService.sendContactNotification(req.body)  // 2) Gửi email (best-effort, không chặn luồng)
        .catch((err) => console.error('✗ Lỗi gửi email liên hệ:', err.message));
      req.flash('success', messages.CONTACT_SUCCESS);
      res.redirect('/lien-he');
    } catch (err) { next(err); }
  },
};
