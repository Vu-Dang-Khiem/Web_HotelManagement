// Trạng thái đơn đặt phòng
module.exports = {
  PENDING: 'pending',         // Chờ xác nhận
  CONFIRMED: 'confirmed',     // Đã xác nhận
  CHECKED_IN: 'checked_in',   // Đã nhận phòng
  CHECKED_OUT: 'checked_out', // Đã trả phòng
  CANCELLED: 'cancelled',     // Đã hủy

  LABELS: {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    checked_in: 'Đã nhận phòng',
    checked_out: 'Đã trả phòng',
    cancelled: 'Đã hủy',
  },

  // Class màu badge (Bootstrap) cho từng trạng thái
  BADGES: {
    pending: 'warning',
    confirmed: 'info',
    checked_in: 'primary',
    checked_out: 'success',
    cancelled: 'danger',
  },
};
