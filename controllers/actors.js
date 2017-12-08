var express = require('express');
var router = express.Router();
var Actor = require('../models/actor');
var auth = require('../middlewares/auth');

// Function for handling MYSQL date formatting
function formatDate(d) {
  var dt = new Date(d);
  var mm = dt.getMonth() + 1;
  var dd = dt.getDate();
  return [dt.getFullYear(),
    (mm>9 ? '' : '0') + mm,
    (dd>9 ? '' : '0') + dd
  ].join('-');
}

// Get the actor details page of the given ID
router.get('/:actor_id', function (req, res, next) {
  Actor.get(req.params.actor_id, function (err, results) {
    if (err) {
      return next(err);
    } else if (results[0].length == 0) {
      return next();
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
      id: req.params.actor_id,
      roles: roles
    });
  });
});

// Get the page for adding new actors
router.get('/add', auth.isAdmin, function (req, res, next) {
  res.render('addActor', { title: 'MyMovieDB Add Actor'});
});

// Post request to submit the new actor's details
router.post('/addActor', auth.isAdmin, function (req, res, next) {
  var actor = {
    "name" : req.body.name,
    "dob" : req.body.dob,
    "bio" : req.body.bio,
    "height" : req.body.height,
    "birthplace" : req.body.birthplace
  };

  Actor.addActor(actor, function (err, results) {
    if (err) return next(err);
    res.redirect('/actor/' + results);
  });
});

// Get the page for editing the details of the actor of given ID
router.get('/:actor_id/edit', auth.isAdmin, function (req, res, next) {
  Actor.get(req.params.actor_id, function (err, results) {
    if (err) {
      return next(err);
    } else if (results[0].length == 0) {
      return next();
    }

    var oldValues = {
      "id" : req.params.actor_id,
      "name" : results[0][0].actor_name,
      "dob" : formatDate(results[0][0].dob),
      "bio" : results[0][0].biography,
      "height" : results[0][0].height_in_inches,
      "birthplace" : results[0][0].birthplace
    };

    res.render('editActor', {
      title: 'MyMovieDB Edit Actor',
      values: oldValues,
      id: req.params.actor_id
    });
  });
});

// Post request for submitting the modified actor's details
router.post('/updateActor', auth.isAdmin, function (req, res, next) {
  var newValues = {
    "id" : req.body.id,
    "name" : req.body.name,
    "dob" : req.body.dob,
    "bio" : req.body.bio,
    "height" : req.body.height,
    "birthplace" : req.body.birthplace
  };

  Actor.editActor(newValues, function (err, results) {
    if (err) return next(err);
    res.redirect('/actor/' + results);
  });
});

// Post request to delete an author
router.post('/deleteActor', auth.isAdmin, function (req, res, next) {
  Actor.deleteActor(req.body.id, function (err, success) {
    if (err) return next(err);
    res.redirect('/');
  });
});

module.exports = router;