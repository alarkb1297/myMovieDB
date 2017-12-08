var express = require('express');
var router = express.Router();
var User = require('../models/user');
var auth = require('../middlewares/auth');

// Get user account page
router.get('/account', auth.loggedIn, function (req, res, next) {

  User.getSavedMovies(req.session.user.username, function (err, result) {
    if (err) {
      return next(err);
    } else {
      var movies = result;
    }

      res.render('account', { title: 'MyMovieDB', movies: movies});
  });
});

// Get user registration page
router.get('/register', function (req, res, next) {
  res.render('register', { title: 'MyMovieDB', retry: req.query.retry });
});

// Post new user info
router.post('/adduser', function(req,res) {
  var username= req.body.username;
  var password = req.body.password;

  if(!username) {
    return res.status(401).send({ "message": "A username is required" });
  } else if(!password) {
    return res.status(401).send({ "message": "A password is required" });
  }

  User.register(username, password, function(err, uname) {
    if (err) {
      if (err.code == "ER_DUP_ENTRY") {
        return res.redirect("register?retry=1");
      } else {
        return next(err);
      }
    }

    res.redirect("/");
  });
});

// Post user authentication
router.post('/login', function(req, res) {
  var username= req.body.username;
  var password = req.body.password;

  // TODO: figure out a better way to display to the user these error messages

  if(!username) {
    return res.status(401).send({ "message": "A username is required" });
  } else if(!password) {
    return res.status(401).send({ "message": "A password is required" });
  }

  User.login(username, password, function(err, uname) {
    if (err) {
      switch(err) {
        case "Username and pass do not match":
          return res.redirect((req.header('Referer') || '/') + "?retry=2");
        case "User not found":
          return res.redirect((req.header('Referer') || '/') + "?retry=3");
        default:
          return next(err);
      }
    }
    User.isAdmin(uname, function (err, result) {
      if (err) {
        return next(err);
      }
      req.session.user = {
        "username" : uname,
        "isAdmin" : result
      };

      res.redirect(req.get('referer'));
    });
  });
});

// Get logout user
router.get('/logout', auth.loggedIn, function(req, res) {
  delete req.session.user;
  res.redirect('/');
});

module.exports = router;