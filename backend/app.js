// backend/app.js
require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const connectDB = require('./db');
const expressFileUpload = require('express-fileupload');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const pengurusRoutes = require('./routes/pengurus');
const profilRoutes = require('./routes/profil');
const kegiatanRoutes = require('./routes/kegiatan');
const dokumenRoutes = require('./routes/dokumen');

var app = express();

connectDB();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressFileUpload());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Gunakan route yang sudah ada
app.use('/api/auth', authRoutes);
// Protected CRUD routes, only admin
app.use('/api/users', userRoutes);
app.use('/api/pengurus', pengurusRoutes);
app.use('/api/profil', profilRoutes);
app.use('/api/kegiatan', kegiatanRoutes);
app.use('/api/dokumen', dokumenRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
