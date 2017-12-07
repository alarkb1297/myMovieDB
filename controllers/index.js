var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Movies = require('../models/movie');
var auth = require('../middlewares/auth');

// Set up routing for subpages
router.use('/', require('./users'));
router.use('/movie', require('./movies'));
router.use('/actor', require('./actors'));
router.use('/', require('./search'));

function formatDate(d) {
  var dt = new Date(d);
  var mm = dt.getMonth() + 1;
  var dd = dt.getDate();
  return [dt.getFullYear(),
    (mm>9 ? '' : '0') + mm,
    (dd>9 ? '' : '0') + dd
  ].join('-');
}

// GET home page.
router.get('/', function (req, res, next) {
  var today = new Date();
  var tomorrow = new Date().setDate(today.getDate() + 1);
  today = formatDate(today);
  tomorrow = formatDate(tomorrow);

  var limit = req.query.limit ? req.query.limit : 5;
  var startDate = req.query.startDate ? req.query.startDate : today;
  var endDate = req.query.endDate ? req.query.endDate : tomorrow;

  Movies.getTopMovies(limit, startDate, endDate,
    function (err, result) {
      if (err) {
        return next(err);
      } else {
        var movies = result;
      }

      res.render('index', {
        title: 'MyMovieDB',
        movies: movies,
        retry: req.query.retry,
        today: today,
        tomorrow: tomorrow
      });
  });
});

module.exports = router;
