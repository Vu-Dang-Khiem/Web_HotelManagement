const RoomTypeModel = require('../models/roomType.model');
const ReviewModel = require('../models/review.model');
const { slugify } = require('../utils/helpers');

const RoomTypeService = {
  async create(data, amenityIds = []) {
    data.slug = slugify(data.name) + '-' + Date.now().toString().slice(-4);
    const id = await RoomTypeModel.create(data);
    await RoomTypeModel.setAmenities(id, amenityIds);
    return id;
  },

  async update(id, data, amenityIds = []) {
    const existing = await RoomTypeModel.findById(id);
    // giữ slug cũ, chỉ tạo mới nếu tên đổi
    data.slug = existing.slug || (slugify(data.name) + '-' + Date.now().toString().slice(-4));
    await RoomTypeModel.update(id, data);
    await RoomTypeModel.setAmenities(id, amenityIds);
  },

  // Chi tiết loại phòng cho trang khách: kèm tiện nghi, ảnh, đánh giá
  async getDetailBySlug(slug) {
    const type = await RoomTypeModel.findBySlug(slug);
    if (!type) return null;
    const [full, amenities, images, reviews] = await Promise.all([
      RoomTypeModel.findById(type.id),
      RoomTypeModel.getAmenities(type.id),
      RoomTypeModel.getImages(type.id),
      ReviewModel.findByRoomType(type.id, true),
    ]);
    return { ...full, amenities, images, reviews };
  },

  async getDetailById(id) {
    const type = await RoomTypeModel.findById(id);
    if (!type) return null;
    const [amenities, images] = await Promise.all([
      RoomTypeModel.getAmenities(id),
      RoomTypeModel.getImages(id),
    ]);
    return { ...type, amenities, images, amenityIds: amenities.map((a) => a.id) };
  },
};

module.exports = RoomTypeService;
