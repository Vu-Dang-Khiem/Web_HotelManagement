// Trạng thái & phương thức thanh toán
module.exports = {
  UNPAID: 'unpaid',     // Chưa thanh toán
  PAID: 'paid',         // Đã thanh toán
  REFUNDED: 'refunded', // Đã hoàn tiền

  LABELS: {
    unpaid: 'Chưa thanh toán',
    paid: 'Đã thanh toán',
    refunded: 'Đã hoàn tiền',
  },

  BADGES: {
    unpaid: 'danger',
    paid: 'success',
    refunded: 'secondary',
  },

  METHODS: {
    cash: 'Tiền mặt',
    card: 'Thẻ ngân hàng',
    transfer: 'Chuyển khoản',
    momo: 'Ví MoMo',
  },
};
