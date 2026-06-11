const PromotionModel = require('../models/promotion.model');

const PromotionService = {
  // Tính số tiền giảm cho 1 mã khuyến mãi áp lên subtotal.
  // Trả về { promotion, discount } hoặc ném lỗi nếu không hợp lệ.
  async apply(code, subtotal) {
    const promo = await PromotionModel.findValidByCode(code.trim().toUpperCase());
    if (!promo) throw new Error('Mã khuyến mãi không tồn tại hoặc đã hết hạn.');
    if (subtotal < Number(promo.min_total)) {
      throw new Error(`Đơn tối thiểu ${Number(promo.min_total).toLocaleString('vi-VN')}đ để dùng mã này.`);
    }
    let discount = 0;
    if (promo.discount_type === 'percent') {
      discount = Math.round((subtotal * Number(promo.discount_value)) / 100);
    } else {
      discount = Number(promo.discount_value);
    }
    discount = Math.min(discount, subtotal); // không vượt quá tổng tiền
    return { promotion: promo, discount };
  },
};

module.exports = PromotionService;
