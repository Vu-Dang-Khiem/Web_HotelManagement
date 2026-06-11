module.exports = {
  name: process.env.APP_NAME || 'Luxury Hotel',
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  sessionSecret: process.env.SESSION_SECRET || 'hotel_secret',
  // Số bản ghi mặc định trên mỗi trang (phân trang)
  pageSize: 10,
  clientPageSize: 9,
  bidv: {
    accountNo: process.env.BIDV_ACCOUNT_NO || '',
    accountName: process.env.BIDV_ACCOUNT_NAME || '',
    branch: process.env.BIDV_BRANCH || '',
  },
};
