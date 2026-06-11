const { validate, V } = require('./validate');

// Validator dùng chung cho các tài nguyên quản trị
const roomTypeValidator = validate({
  name: [V.required('Tên loại phòng')],
  base_price: [V.required('Giá'), V.isNumber('Giá'), V.min('Giá', 0)],
  capacity: [V.required('Sức chứa'), V.isNumber('Sức chứa'), V.min('Sức chứa', 1)],
});

const roomValidator = validate({
  room_type_id: [V.required('Loại phòng')],
  room_number: [V.required('Số phòng')],
});

const serviceValidator = validate({
  name: [V.required('Tên dịch vụ')],
  price: [V.required('Giá'), V.isNumber('Giá'), V.min('Giá', 0)],
});

const promotionValidator = validate({
  code: [V.required('Mã khuyến mãi')],
  name: [V.required('Tên chương trình')],
  discount_value: [V.required('Giá trị giảm'), V.isNumber('Giá trị giảm'), V.min('Giá trị giảm', 0)],
});

const userValidator = validate({
  full_name: [V.required('Họ tên')],
  email: [V.required('Email'), V.email('Email')],
  role_id: [V.required('Vai trò')],
});

const contactValidator = validate({
  name: [V.required('Họ tên')],
  email: [V.required('Email'), V.email('Email')],
  message: [V.required('Nội dung')],
});

const amenityValidator = validate({
  name: [V.required('Tên tiện nghi')],
});

module.exports = {
  roomTypeValidator,
  roomValidator,
  serviceValidator,
  promotionValidator,
  userValidator,
  contactValidator,
  amenityValidator,
};
