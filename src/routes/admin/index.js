const express = require('express');
const router = express.Router();

const { requireAdmin } = require('../../middlewares/role.middleware');
const upload = require('../../middlewares/upload.middleware');
const {
  roomTypeValidator, roomValidator, serviceValidator,
  promotionValidator, userValidator, amenityValidator,
} = require('../../validators/resource.validator');

const dashboard = require('../../controllers/admin/dashboard.controller');
const roomType = require('../../controllers/admin/roomType.controller');
const room = require('../../controllers/admin/room.controller');
const amenity = require('../../controllers/admin/amenity.controller');
const service = require('../../controllers/admin/service.controller');
const promotion = require('../../controllers/admin/promotion.controller');
const booking = require('../../controllers/admin/booking.controller');
const user = require('../../controllers/admin/user.controller');
const review = require('../../controllers/admin/review.controller');
const contact = require('../../controllers/admin/contact.controller');
const statistics = require('../../controllers/admin/statistics.controller');

// Tất cả route admin: bắt buộc quyền admin + dùng layout admin
router.use(requireAdmin);
router.use((req, res, next) => { res.locals.layout = 'layouts/admin'; res.locals.area = 'admin'; next(); });

// Dashboard
router.get('/', dashboard.index);

// Loại phòng
router.get('/loai-phong', roomType.index);
router.get('/loai-phong/them', roomType.create);
router.post('/loai-phong', upload.single('thumbnailFile'), roomTypeValidator, roomType.store);
router.get('/loai-phong/:id/sua', roomType.edit);
router.put('/loai-phong/:id', upload.single('thumbnailFile'), roomTypeValidator, roomType.update);
router.delete('/loai-phong/:id', roomType.destroy);
router.delete('/loai-phong/:id/anh/:imageId', roomType.removeImage);

// Phòng
router.get('/phong', room.index);
router.get('/phong/them', room.create);
router.post('/phong', roomValidator, room.store);
router.get('/phong/:id/sua', room.edit);
router.put('/phong/:id', roomValidator, room.update);
router.delete('/phong/:id', room.destroy);

// Tiện nghi
router.get('/tien-nghi', amenity.index);
router.post('/tien-nghi', amenityValidator, amenity.store);
router.put('/tien-nghi/:id', amenityValidator, amenity.update);
router.delete('/tien-nghi/:id', amenity.destroy);

// Dịch vụ
router.get('/dich-vu', service.index);
router.get('/dich-vu/them', service.create);
router.post('/dich-vu', serviceValidator, service.store);
router.get('/dich-vu/:id/sua', service.edit);
router.put('/dich-vu/:id', serviceValidator, service.update);
router.delete('/dich-vu/:id', service.destroy);

// Khuyến mãi
router.get('/khuyen-mai', promotion.index);
router.get('/khuyen-mai/them', promotion.create);
router.post('/khuyen-mai', promotionValidator, promotion.store);
router.get('/khuyen-mai/:id/sua', promotion.edit);
router.put('/khuyen-mai/:id', promotionValidator, promotion.update);
router.delete('/khuyen-mai/:id', promotion.destroy);

// Đặt phòng
router.get('/dat-phong', booking.index);
router.get('/dat-phong/:id', booking.detail);
router.put('/dat-phong/:id/trang-thai', booking.updateStatus);
router.put('/dat-phong/:id/gan-phong', booking.assignRoom);
router.put('/dat-phong/:id/thanh-toan', booking.markPaid);

// Người dùng
router.get('/nguoi-dung', user.index);
router.get('/nguoi-dung/them', user.create);
router.post('/nguoi-dung', userValidator, user.store);
router.get('/nguoi-dung/:id/sua', user.edit);
router.put('/nguoi-dung/:id', userValidator, user.update);
router.put('/nguoi-dung/:id/khoa', user.toggleStatus);
router.delete('/nguoi-dung/:id', user.destroy);

// Đánh giá
router.get('/danh-gia', review.index);
router.put('/danh-gia/:id/toggle', review.toggle);
router.delete('/danh-gia/:id', review.destroy);

// Liên hệ
router.get('/lien-he', contact.index);
router.get('/lien-he/:id', contact.show);
router.delete('/lien-he/:id', contact.destroy);

// Thống kê
router.get('/thong-ke', statistics.index);

module.exports = router;
