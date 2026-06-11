require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./src/config/db');
const appConfig = require('./src/config/app.config');

const PORT = appConfig.port;

(async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log('==============================================');
    console.log(`  ${appConfig.name} đang chạy`);
    console.log(`  → http://localhost:${PORT}`);
    console.log(`  Môi trường: ${appConfig.env}`);
    console.log('==============================================');
  });
})();
