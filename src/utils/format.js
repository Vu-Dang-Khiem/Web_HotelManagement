const dayjs = require('dayjs');

// Định dạng tiền tệ VND: 1500000 -> "1.500.000 ₫"
function formatCurrency(value) {
  const n = Number(value) || 0;
  return n.toLocaleString('vi-VN') + ' ₫';
}

// Định dạng số: 1500000 -> "1.500.000"
function formatNumber(value) {
  return (Number(value) || 0).toLocaleString('vi-VN');
}

// Ngày: "2026-06-10" -> "10/06/2026"
function formatDate(value) {
  if (!value) return '';
  return dayjs(value).format('DD/MM/YYYY');
}

// Ngày giờ: -> "10/06/2026 14:30"
function formatDateTime(value) {
  if (!value) return '';
  return dayjs(value).format('DD/MM/YYYY HH:mm');
}

// Số đêm giữa 2 ngày
function nightsBetween(checkIn, checkOut) {
  const d = dayjs(checkOut).diff(dayjs(checkIn), 'day');
  return d > 0 ? d : 0;
}

module.exports = { formatCurrency, formatNumber, formatDate, formatDateTime, nightsBetween };
