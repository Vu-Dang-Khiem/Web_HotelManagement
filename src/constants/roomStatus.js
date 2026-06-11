// Trạng thái phòng
module.exports = {
  AVAILABLE: 'available',     // Trống / sẵn sàng
  OCCUPIED: 'occupied',       // Đang có khách
  MAINTENANCE: 'maintenance', // Đang bảo trì

  LABELS: {
    available: 'Trống',
    occupied: 'Đang sử dụng',
    maintenance: 'Bảo trì',
  },

  BADGES: {
    available: 'success',
    occupied: 'primary',
    maintenance: 'secondary',
  },
};
