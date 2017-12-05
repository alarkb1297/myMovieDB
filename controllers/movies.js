var express = require('express');
var router = express.Router();
var Movie = require('../models/movie');
var User = require('../models/user');
var auth = require('../middlewares/auth');

router.post('/savemovie', auth, function (req, res, next) {
  User.saveMovie(req.session.user.username, req.body.id, function (err, success) {
    if (err) {
      return res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    }

    res.redirect(req.get('referer'));
  });

  // Way to see if the user has saved the movie
  // User.savedMovie(req.session.user, req.body.id, function (err, isSaved) {
  //   console.log(isSaved);
  // });
});

router.get('/:movie_id', function (req, res, next) {
  User.savedMovie(req.session.user.username, req.params.movie_id, function (err, isSaved) {
    if (err) {
      return res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    }

    Movie.get(req.params.movie_id, function (err, results) {
      if (err) {
        return res.send({
          "code": 400,
          "failed": "error ocurred"
        })
      } else if (results[0].length == 0) {
        return res.send({
          "code": 404,
          "failed": "not found"
        })
      }
      // May want to abstract this role processes since it's in actor too
      var roleresults = results[0][0].rolelist
      var roles = [];

      // Only operate if the movie has roles in it
      if (roleresults) {
        var rolelist = roleresults.split(',');

        rolelist.forEach(function (entry) {
          var name = entry.substring(0, entry.indexOf(':'));
          var actor = entry.substring(entry.indexOf(':') + 1, entry.indexOf('/'));
          var id = parseInt(entry.substring(entry.indexOf('/') + 1, entry.length));

          roles.push({
            "name": name,
            "actor": actor,
            "id": id
          })
        });
      }

      res.render('movie', {
        title: 'MyMovieDB Details Page',
        details: results[0][0],
        roles: roles,
        id: req.params.movie_id,
        isSaved: isSaved
      });
    });
  });
});

module.exports = router;