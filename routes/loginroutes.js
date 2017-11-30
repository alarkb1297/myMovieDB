exports.checkAuth = function(req, res, next) {
  if (!req.session.user) {
    res.send('You are not logged in.');
  } else {
    next();
  }
}

exports.register = function(req,res){
  var users={
    "username":req.body.username,
    "user_password":req.body.password
  }
  if (!users.username) {
    return res.status(401).send({ "message": "A username is required" });
  } else if(!users.user_password) {
    return res.status(401).send({ "message": "A password is required" });
  }
  req.db.query('INSERT INTO movie_user SET ?',users, function (error, result, fields) {
    if (error) {
      console.log("error ocurred", error);
      res.send({
        "code":400,
        "failed":"error ocurred"
      })
    } else {
      console.log('The solution is: ', result);
      // res.send({
      //   "code":200,
      //   "success":"user registered sucessfully"
      // });
      res.redirect("/");
    }
  });
}

exports.login = function(req, res) {
  var username= req.body.username;
  var password = req.body.password;

  if(!username) {
    return res.status(401).send({ "message": "A username is required" });
  } else if(!password) {
    return res.status(401).send({ "message": "A password is required" });
  }

  req.db.query('SELECT * FROM movie_user WHERE username = ?', [username], function (error, result, fields) {
    if (error) {
      res.send({
        "code":400,
        "failed":"error occurred"
      })
    } else {
      if (result.length > 0) {
        if (result[0].user_password == password) {
          req.session.user = result[0].username;
          console.log("Login: " + req.session.user)
          //res.send("account");
          res.redirect("account");
          // res.send({
          //   "code":200,
          //   "success":"Login successful"
          // });
        } else {
          res.send({
            "code":204,
            "success":"Username and password does not match"
          });
        }
      } else {
        res.send({
          "code":204,
          "success":"Username does not exits"
        });
      }
    }
  });
}

exports.logout = function(req, res) {
  delete req.session.user;
  res.redirect('/');
}