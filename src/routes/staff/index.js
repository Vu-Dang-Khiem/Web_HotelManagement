const express = require('express');
const router = express.Router();

const { requireStaff } = require('../../middlewares/role.middleware');
const { bookingValidator } = require('../../validators/booking.validator');

const dashboard = require('../../controllers/staff/dashboard.controller');
const booking = require('../../controllers/staff/booking.controller');
const room = require('../../controllers/staff/room.controller');
const invoice = require('../../controllers/staff/invoice.controller');

// Tất cả route lễ tân: bắt buộc quyền staff/admin + layout staff
router.use(requireStaff);
router.use((req, res, next) => { res.locals.layout = 'layouts/staff'; res.locals.area = 'staff'; next(); });

// Dashboard
router.get('/', dashboard.index);

// Đặt phòng
router.get('/dat-phong', booking.index);
router.get('/dat-phong/them', booking.create);
router.post('/dat-phong', bookingValidator, booking.store);
router.get('/dat-phong/:id', booking.detail);
router.put('/dat-phong/:id/trang-thai', booking.updateStatus);
router.put('/dat-phong/:id/gan-phong', booking.assignRoom);

// Sơ đồ phòng
router.get('/phong', room.index);
router.put('/phong/:id/trang-thai', room.updateStatus);

// Hóa đơn
router.get('/hoa-don', invoice.index);
router.post('/hoa-don/tu-dat-phong/:bookingId', invoice.createFromBooking);
router.get('/hoa-don/:id', invoice.detail);
router.get('/hoa-don/:id/in', invoice.print);

module.exports = router;
