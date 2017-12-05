var express = require('express');
var router = express.Router();
var Actor = require('../models/actor');

router.get('/:actor_id', function (req, res, next) {
  Actor.get(req.params.actor_id, function (err, results) {
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

    var roleresults = results[0][0].movielist
    var roles = [];

    if (roleresults) {
      var rolelist = roleresults.split(',');

      rolelist.forEach(function (entry) {
        var name = entry.substring(0, entry.indexOf(':'));
        var title = entry.substring(entry.indexOf(':') + 1, entry.indexOf('/'));
        var id = parseInt(entry.substring(entry.indexOf('/') + 1, entry.length));

        roles.push({
          "name": name,
          "title": title,
          "id": id
        })
      });
    }

    res.render('actor', {
      title: 'MyMovieDB Details Page',
      details: results[0][0],
      roles: roles
    });
  });

});

module.exports = router;