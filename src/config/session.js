const session = require('express-session');
const flash = require('connect-flash');
const appConfig = require('./app.config');

// Gói middleware session + flash thành 1 mảng để app.use()
const sessionMiddleware = session({
  secret: appConfig.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 ngày
    httpOnly: true,
  },
});

module.exports = [sessionMiddleware, flash()];
