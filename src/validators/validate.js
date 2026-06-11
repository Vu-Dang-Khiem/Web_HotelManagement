// Bộ kiểm tra dữ liệu nhỏ gọn, trả về middleware Express.
// Mỗi rule là 1 hàm (value, body) => string|null (null = hợp lệ)

const V = {
  required: (label) => (v) => (v === undefined || v === null || String(v).trim() === '')
    ? `${label} không được để trống.` : null,
  email: (label) => (v) => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
    ? `${label} không hợp lệ.` : null,
  minLength: (label, n) => (v) => (v && String(v).length < n)
    ? `${label} phải có ít nhất ${n} ký tự.` : null,
  isNumber: (label) => (v) => (v !== '' && v !== undefined && isNaN(Number(v)))
    ? `${label} phải là số.` : null,
  min: (label, n) => (v) => (v !== '' && Number(v) < n)
    ? `${label} phải lớn hơn hoặc bằng ${n}.` : null,
  phone: (label) => (v) => (v && !/^[0-9+\-\s]{8,15}$/.test(v))
    ? `${label} không hợp lệ.` : null,
};

// Tạo middleware validate từ object định nghĩa các trường -> mảng rule
function validate(rules) {
  return (req, res, next) => {
    const errors = [];
    for (const field in rules) {
      const value = req.body[field];
      for (const rule of rules[field]) {
        const err = rule(value, req.body);
        if (err) { errors.push(err); break; }
      }
    }
    if (errors.length) {
      req.flash('error', errors);
      req.flash('formData', req.body);
      return res.redirect('back');
    }
    next();
  };
}

module.exports = { validate, V };
