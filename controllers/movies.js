var express = require('express');
var router = express.Router();
var Movie = require('../models/movie');
var User = require('../models/user');
var auth = require('../middlewares/auth');

router.get('/:movie_id/edit', auth.isAdmin, function (req, res, next) {
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

    var oldValues = {
      "id" : req.params.movie_id,
      "title" : results[0][0].title,
      "director" : results[0][0].director_name,
      "year" : results[0][0].release_year,
      "genre" : results[0][0].genre,
      "summary" : results[0][0].summary,
      "trailer" : results[0][0].trailer
    };

    res.render('editMovie', {
      title: 'MyMovieDB Add Movie',
      values: oldValues,
      id: req.params.movie_id
    });
  });
});

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

  Movie.editMovie(newValues, function (err, success) {
    if (err) {
      return res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    }

    res.redirect('/movie/' + success);
  });
});

router.post('/deleteMovie', auth.isAdmin, function (req, res, next) {
  Movie.deleteMovie(req.body.id, function (err, success) {
    if (err) {
      return res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    }

    res.redirect('/');
  });
});

router.post('/savemovie', auth.loggedIn, function (req, res, next) {
  User.saveMovie(req.session.user.username, req.body.id, function (err, success) {
    if (err) {
      return res.send({
        "code": 400,
        "failed": "error ocurred"
      })
    }
    res.redirect(req.get('referer'));
  });
});

router.post('/reviewMovie', auth.loggedIn, function (req, res, next) {
    Movie.addReview(req.body.id, req.session.user.username, req.body.review, function (err, success) {
        if (err) {
            return res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        }
        res.redirect(req.get('referer'));
    });
});

router.post('/ratemovie', auth.loggedIn, function (req, res, next) {
  Movie.rate(req.body.id, req.body.rating, req.session.user.username, function (err, success) {
    if (err) {
      return res.send({
        "code": 400,
        "failed": "error ocurred"
      });
    }
    res.redirect(req.get('referer'));
  });
});

router.post('/insertMovie', auth.isAdmin, function (req, res, next) {
    var movie = {
        "title" : req.body.title,
        "director" : req.body.director,
        "year" : req.body.year,
        "genre" : req.body.genre,
        "summary" : req.body.summary,
        "trailer" : req.body.trailer
    };

    Movie.addMovie(movie, function (err, success) {
        if (err) {
            return res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        }

        res.redirect('/movie/' + success);
    });
});

router.get('/addMovie', auth.isAdmin, function (req, res, next) {
    res.render('addMovie', { title: 'MyMovieDB Add Movie'});
});

router.post('/insertRole', auth.isAdmin, function (req, res, next) {
    var role = {
        "name" : req.body.name,
        "role" : req.body.role
    };

    Movie.addRole(role, req.body.id, function (err, success) {
        if (err) {
            next(err);
        }

        res.redirect('/movie/' + success);
    });
});


router.get('/:movie_id/addRole', auth.isAdmin, function (req, res, next) {
    res.render('addRole', { title: 'MyMovieDB Add Role', id: req.params.movie_id});
});

router.get('/:movie_id', function (req, res, next) {
  if (req.session.user) {
    User.savedMovie(req.session.user.username, req.params.movie_id, function (err, isSaved) {
      if (err) {
        return res.send({
          "code": 400,
          "failed": "error ocurred"
        })
      }

      res.locals.isSaved = isSaved;
      next();
    });
  } else {
    res.locals.isSaved = false;
    next();
  }
});

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



module.exports = router;