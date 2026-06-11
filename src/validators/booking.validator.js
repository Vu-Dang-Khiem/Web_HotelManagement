const { validate, V } = require('./validate');

const bookingValidator = validate({
  guest_name: [V.required('Họ tên khách')],
  guest_phone: [V.required('Số điện thoại'), V.phone('Số điện thoại')],
  check_in: [V.required('Ngày nhận phòng')],
  check_out: [V.required('Ngày trả phòng')],
  adults: [V.required('Số người lớn'), V.isNumber('Số người lớn'), V.min('Số người lớn', 1)],
});

module.exports = { bookingValidator };
