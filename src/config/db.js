const mysql = require('mysql2/promise');

// Tạo connection pool dùng chung toàn ứng dụng
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hotel_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  charset: 'utf8mb4',
});

// Kiểm tra kết nối khi khởi động server
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✓ Kết nối MySQL thành công');
    conn.release();
  } catch (err) {
    console.error('✗ Kết nối MySQL thất bại:', err.message);
    console.error('  Hãy kiểm tra file .env và đảm bảo đã chạy database/schema.sql');
  }
}

// Lưu ý: KHÔNG gán module.exports.pool = pool vì sẽ ghi đè thuộc tính
// nội bộ `.pool` của PromisePool (gây đệ quy vô hạn khi query).
module.exports = pool;
module.exports.testConnection = testConnection;
