var express = require('express');
var router = express.Router();
var User = require('../models/user');
var auth = require('../middlewares/auth');


/* GET accounts page */
router.get('/account', auth, function (req, res, next) {
  res.render('account', { title: 'MyMovieDB' })
});

/* GET register page */
router.get('/register', function (req, res, next) {
  res.render('register', { title: 'MyMovieDB', retry: req.query.retry });
});

/* POST new user info */
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
        return res.send({
          "code": 400,
          "failed": "error ocurred"
        })
      }
    }

    res.redirect("/");
  });
});

/* POST user authentication */
router.post('/login', function(req, res) {
  var username= req.body.username;
  var password = req.body.password;

  // figure out a better way to display to the user these error messages

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
          // https://stackoverflow.com/questions/12442716/res-redirectback-with-parameters
        default:
          return res.send({
            "code": 400,
            "failed": "error occurred"
          });
      }
    }
    req.session.user = uname;
    res.redirect("/account");
  });
});

/* GET logout user */
router.get('/logout', auth, function(req, res) {
  delete req.session.user;
  res.redirect('/');
});


module.exports = router;