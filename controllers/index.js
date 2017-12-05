var express = require('express');
var router = express.Router();
var User = require('../models/user');
var auth = require('../middlewares/auth');

// Set up routing for subpages
router.use('/', require('./users'));
router.use('/movie', require('./movies'));
router.use('/actor', require('./actors'));
router.use('/', require('./search'));

// GET home page.
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'MyMovieDB',
    retry: req.query.retry
  })
});

module.exports = router;
