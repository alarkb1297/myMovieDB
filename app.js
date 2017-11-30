var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var session = require('express-session');

var index = require('./routes/index');
var users = require('./routes/users');
var newAccount = require('./routes/register');
var login = require('./routes/loginroutes');
var account = require('./routes/account');
var search = require('./routes/search');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // TODO: This was false, check to see if it has to be true
app.use(cookieParser());
app.use(session({
  secret: 'Ghita-Rulez',
  //key: 'sid',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // will need HTTPS to be true
}));
app.use(express.static(path.join(__dirname, 'public')));

var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Alark212',
  database : 'movieDB'
});

db.connect(function(err){
  if(!err) {
    console.log("Database is connected.");
  } else {
    console.log("Error connecting database");
  }
});

app.use(function(req, res, next){
  req.db = db;
  res.locals.session = req.session;
  next();
});

app.use('/', index);
app.use('/users', users);
app.use('/register', newAccount);
app.use('/account', account);
app.use('/search', search);
app.post('/adduser', login.register);
app.post('/login', login.login);
app.get('/logout', login.logout);

// Needed for login stuff, I think
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  req.db = db;
  next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
