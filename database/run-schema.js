/**
 * Chạy database/schema.sql để tạo database & bảng.
 * Dùng khi không có sẵn MySQL CLI:  node database/run-schema.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true, // schema.sql gồm nhiều câu lệnh
    charset: 'utf8mb4',
  });
  console.log('→ Đang chạy schema.sql...');
  await conn.query(sql);
  console.log('✓ Đã tạo database & toàn bộ bảng thành công');
  await conn.end();
})().catch((e) => {
  console.error('✗ Lỗi khi chạy schema:', e.message);
  process.exit(1);
});
