var express = require('express');
var auth = require('./loginroutes');
var router = express.Router();

/* GET account page. */
router.get('/', auth.checkAuth, function (req, res, next) {
  res.render('account', { title: 'MyMovieDB' })
});

module.exports = router;