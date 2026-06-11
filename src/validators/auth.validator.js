const { validate, V } = require('./validate');

const registerValidator = validate({
  full_name: [V.required('Họ tên')],
  email: [V.required('Email'), V.email('Email')],
  password: [V.required('Mật khẩu'), V.minLength('Mật khẩu', 6)],
  phone: [V.phone('Số điện thoại')],
});

const loginValidator = validate({
  email: [V.required('Email'), V.email('Email')],
  password: [V.required('Mật khẩu')],
});

module.exports = { registerValidator, loginValidator };
