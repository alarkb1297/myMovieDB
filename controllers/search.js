var express = require('express');
var router = express.Router();

/* GET search page and results. */
router.get('/', function (req, res, next) {
  res.render('search', { title: 'MyMovieDB search results' })
  // https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters#post-parameters
});

module.exports = router;
