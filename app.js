const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');

const session = require('./src/config/session');
const appConfig = require('./src/config/app.config');
const localsMiddleware = require('./src/middlewares/locals.middleware');
const registerRoutes = require('./src/routes');
const notFoundMiddleware = require('./src/middlewares/notFound.middleware');
const errorMiddleware = require('./src/middlewares/error.middleware');

const app = express();

// View engine + layout
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(expressLayouts);
app.set('layout', 'layouts/client');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Body parser + method override (giả lập PUT/DELETE từ form)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Giả lập PUT/DELETE: đọc _method từ query string (?_method=PUT) hoặc body
app.use(methodOverride((req) => {
  if (req.query && '_method' in req.query) return req.query._method;
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// Static files
app.use(express.static(path.join(__dirname, 'src/public')));

// Session + flash
app.use(session);

// Biến dùng chung cho mọi view (user, flash, config...)
app.use(localsMiddleware);

// Đăng ký toàn bộ routes
registerRoutes(app);

// 404 + xử lý lỗi
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
