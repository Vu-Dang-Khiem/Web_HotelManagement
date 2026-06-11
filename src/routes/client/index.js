const express = require('express');
const router = express.Router();

const homeController = require('../../controllers/client/home.controller');
const authController = require('../../controllers/client/auth.controller');
const roomController = require('../../controllers/client/room.controller');
const bookingController = require('../../controllers/client/booking.controller');
const profileController = require('../../controllers/client/profile.controller');

const { requireAuth, requireGuest } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');
const { registerValidator, loginValidator } = require('../../validators/auth.validator');
const { bookingValidator } = require('../../validators/booking.validator');
const { contactValidator } = require('../../validators/resource.validator');

// ---------- Trang tĩnh ----------
router.get('/', homeController.index);
router.get('/gioi-thieu', homeController.about);
router.get('/dich-vu', homeController.services);
router.get('/khuyen-mai', homeController.promotions);
router.get('/lien-he', homeController.contact);
router.post('/lien-he', contactValidator, homeController.submitContact);

// ---------- Phòng ----------
router.get('/phong', roomController.list);
router.get('/phong/:slug', roomController.detail);

// ---------- Xác thực ----------
router.get('/login', requireGuest, authController.showLogin);
router.post('/login', loginValidator, authController.login);
router.get('/register', requireGuest, authController.showRegister);
router.post('/register', registerValidator, authController.register);
router.get('/logout', authController.logout);

// ---------- Đặt phòng ----------
router.get('/dat-phong/thanh-toan/:code', bookingController.payment);
router.get('/dat-phong/thanh-cong/:code', bookingController.success);
router.get('/dat-phong/:slug', bookingController.showForm);
router.post('/dat-phong/:slug', bookingValidator, bookingController.create);

// ---------- Tài khoản (yêu cầu đăng nhập) ----------
router.get('/tai-khoan', requireAuth, profileController.show);
router.put('/tai-khoan', requireAuth, upload.single('avatar'), profileController.update);
router.put('/tai-khoan/doi-mat-khau', requireAuth, profileController.changePassword);
router.post('/tai-khoan/danh-gia', requireAuth, profileController.submitReview);

router.get('/tai-khoan/don-dat', requireAuth, bookingController.myBookings);
router.get('/tai-khoan/don-dat/:id', requireAuth, bookingController.detail);
router.put('/tai-khoan/don-dat/:id/huy', requireAuth, bookingController.cancel);

module.exports = router;
