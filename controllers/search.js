var express = require('express');
var router = express.Router();
var Search = require('../models/search');

/* GET search page and results. */
router.get('/search', function (req, res, next) {
  var query = req.query.search;
  var sortm = parseInt(req.query.sortmode);
  var sorto = parseInt(req.query.sortorder);

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

        if (movies.length > 0) {
          switch (sortm) {
            case 1:
              movies.sort(function (a, b) {
                if (sorto == 1) return a.title.localeCompare(b.title);
                else return b.title.localeCompare(a.title)
              });
              break;
            case 2:
              movies.sort(function (a, b) {
                if (sorto == 1) return a.user_rating - b.user_rating;
                else return b.user_rating - a.user_rating;
              });
              break;
            case 3:
              movies.sort(function (a, b) {
                // TODO: Add view count to db
                if (sorto == 1) return a.view_count - b.view_count;
                else return b.view_count - a.view_count;
              });
              break;
            case 4:
              movies.sort(function (a, b) {
                if (sorto == 1) return a.release_year - b.release_year;
                else return b.release_year - a.release_year;
              });
              break;
          }
        }

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
