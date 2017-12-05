var express = require('express');
var router = express.Router();
var Movie = require('../models/movie');

router.get('/:movie_id', function (req, res, next) {
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

    console.log(roles.length);

    res.render('movie', {
      title: 'MyMovieDB Details Page',
      details: results[0][0],
      roles: roles
    });
  });

});

module.exports = router;