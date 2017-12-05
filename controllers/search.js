var express = require('express');
var router = express.Router();
var Search = require('../models/search');

/* GET search page and results. */
router.get('/search', function (req, res, next) {
  var query = req.query.search;

  Search.search(query, 0, function (err, results) {
    if (err) {
      return res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    }

    var movies = results[0];

    Search.search(query, 1, function (err, results) {
      if (err) {
        return res.send({
          "code": 400,
          "failed": "error ocurred"
        })
      }

      var actors = results[0];

      Search.search(query, 2, function (err, results) {
        if (err) {
          return res.send({
            "code": 400,
            "failed": "error ocurred"
          })
        }

        var roles = results[0];

        res.render('search', {
          title: 'MyMovieDB search results',
          movies: movies,
          actors: actors,
          roles: roles
        });
      });
    });
  });
});

module.exports = router;
