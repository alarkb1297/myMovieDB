var express = require('express');
var router = express.Router();
var Movie = require('../models/movie');
var User = require('../models/user');
var auth = require('../middlewares/auth');

// Function for turning the concatenated string list of roles into a list of role objects
function makeRoleList(rl) {
  var roles = [];

  // Only operate if the movie has roles in it
  if (rl) {
    var rolelist = rl.split(',');

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

  return roles;
}

// Middleware for seeing if a user is logged in, and whether or not they have saved the movie
router.get('/:movie_id', function (req, res, next) {
  if (req.session.user) {
    User.savedMovie(req.session.user.username, req.params.movie_id, function (err, isSaved) {
      if (err) {
        return next(err);
      }

      res.locals.isSaved = isSaved;
      next();
    });
  } else {
    res.locals.isSaved = false;
    next();
  }
});

// Get the main details about the movie of given ID
router.get('/:movie_id', function (req, res, next) {
  Movie.get(req.params.movie_id, function (err, results) {
    if (err) {
      return next(err);
    } else if (results[0].length == 0) {
      return next();
    }

    roles = makeRoleList(results[0][0].rolelist);

    Movie.getReviews(req.params.movie_id, function (err, results2) {

      var reviews = [];

      results2.forEach(function (entry) {
        var text = entry.review_text;
        var username = entry.username;

        reviews.push({
          "text" : text,
          "username" : username
        })
      });

      res.render('movie', {
        title: 'MyMovieDB Details Page',
        details: results[0][0],
        roles: roles,
        id: req.params.movie_id,
        reviews: reviews
      });
    });
  });
});

// Get the page for adding a new movie
router.get('/add', auth.isAdmin, function (req, res, next) {
  res.render('addMovie', { title: 'MyMovieDB Add Movie'});
});

// Post request for the values of the new movie
router.post('/insertMovie', auth.isAdmin, function (req, res, next) {
  var movie = {
    "title" : req.body.title,
    "director" : req.body.director,
    "year" : req.body.year,
    "genre" : req.body.genre,
    "summary" : req.body.summary,
    "trailer" : req.body.trailer
  };

  var roles = [];

  Movie.addMovie(movie, function (err, newid) {
    if (err) return next(err);

    // Only insert if they inputted some values
    if (req.body.rolename0 && req.body.actorid0) {
      var keys = Object.keys(req.body);

      for (i = 6; i < keys.length; i += 2) {
        var name = req.body[keys[i]];
        var actor = req.body[keys[i + 1]]

        roles.push({
          "name": name,
          "actor": actor
        });
      }

      Movie.addRoles(newid, roles, function(err, success) {
        if (err) return next(err);

        return res.redirect('/movie/' + success);
      });
    } else {
      return res.redirect('/movie/' + newid);
    }
  });
});

// Get the page for editing the movie of given ID
router.get('/:movie_id/edit', auth.isAdmin, function (req, res, next) {
  Movie.get(req.params.movie_id, function (err, results) {
    if (err) {
      return next(err);
    } else if (results[0].length == 0) {
      return next();
    }

    var oldValues = {
      "id" : req.params.movie_id,
      "title" : results[0][0].title,
      "director" : results[0][0].director_name,
      "year" : results[0][0].release_year,
      "genre" : results[0][0].genre,
      "summary" : results[0][0].summary,
      "trailer" : results[0][0].trailer
    };

    roles = makeRoleList(results[0][0].rolelist);

    res.render('editMovie', {
      title: 'MyMovieDB Edit Movie',
      values: oldValues,
      roles: roles,
      id: req.params.movie_id
    });
  });
});

// Post request for the modified values of the movie of given ID
router.post('/updateMovie', auth.isAdmin, function (req, res, next) {
  var newValues = {
    "id" : req.body.id,
    "title" : req.body.title,
    "director" : req.body.director,
    "year" : req.body.year,
    "genre" : req.body.genre,
    "summary" : req.body.summary,
    "trailer" : req.body.trailer
  };

  var roles = [];

  Movie.editMovie(newValues, function (err, success) {
    if (err) return next(err);

    var keys = Object.keys(req.body);

    // -1 to account for the fact id is the final key
    for (i = 6; i < keys.length - 1; i += 2) {
      var name = req.body[keys[i]];
      var actor = req.body[keys[i + 1]]

      roles.push({
        "name": name,
        "actor": actor
      });
    }

    Movie.editRoles(newValues.id, roles, function(err, success) {
      if (err) return next(err);

      return res.redirect('/movie/' + success);
    });
  });
});

// Post request for saving a movie to the user's account
router.post('/savemovie', auth.loggedIn, function (req, res, next) {
  User.saveMovie(req.session.user.username, req.body.id, function (err, success) {
    if (err) return next(err);
    res.redirect(req.get('referer'));
  });
});

// Post request for submitting a user's review
router.post('/reviewMovie', auth.loggedIn, function (req, res, next) {
  Movie.addReview(req.body.id, req.session.user.username, req.body.review, function (err, success) {
    if (err) {
      return next(err);
    }

    res.redirect(req.get('referer'));
  });
});

// Post request for submitting a user's rating
router.post('/ratemovie', auth.loggedIn, function (req, res, next) {
  Movie.rate(req.body.id, req.body.rating, req.session.user.username, function (err, success) {
    if (err) {
      return next(err);
    }

    res.redirect(req.get('referer'));
  });
});

// Post request for deleting a movie
router.post('/deleteMovie', auth.isAdmin, function (req, res, next) {
  Movie.deleteMovie(req.body.id, function (err, success) {
    if (err) return next(err);
    res.redirect('/');
  });
});

module.exports = router;