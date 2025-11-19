var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// i created
var { engine } = require('express-handlebars');
var fileUpload = require('express-fileupload');
const { connectDB } = require('./config/connection');
var session = require('express-session')

const bodyParser = require('body-parser');


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var evManagerRouter = require('./routes/ev-manager');
var turfManagerRouter = require('./routes/turf-manager');
var poolManagerRouter = require('./routes/pool-manager');
var hallManagerRouter = require('./routes/hall-manager');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// my
app.engine('hbs', engine({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/', partialsDir: __dirname + '/views/partials/' }));
app.use(fileUpload());
connectDB().then(() => {
  console.log('Database connected');
}).catch(err => {
  console.error('Failed to connect to the database:', err);
  process.exit(1); // Exit the process if the database connection fails
});
app.use(
  session({
    secret: 'key', // Replace with a strong secret
    resave: false, // Prevents resaving session if nothing is modified
    saveUninitialized: false, // Prevents saving uninitialized sessions
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/pay', userRouter);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/evmanager', evManagerRouter);
app.use('/turfmanager', turfManagerRouter);
app.use('/poolmanager', poolManagerRouter);
app.use('/hallmanager', hallManagerRouter);


// catch 404 and forward to error handle
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
