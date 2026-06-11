const dayjs = require('dayjs');

// Tạo mã code dạng tiền tố + ngày + số ngẫu nhiên: BK20260609-1234
function generateCode(prefix = 'BK') {
  const date = dayjs().format('YYYYMMDD');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${date}-${rand}`;
}

// Chuyển tên thành slug không dấu: "Phòng Deluxe" -> "phong-deluxe"
function slugify(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // bỏ dấu thanh
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Ép về số nguyên, có giá trị mặc định
function toInt(value, def = 0) {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? def : n;
}

module.exports = { generateCode, slugify, toInt };
