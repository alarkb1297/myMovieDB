exports.checkAuth = function(req, res, next) {
  if (!req.session.user) {
    res.send('You are not logged in.');
  } else {
    next();
  }
}

exports.register = function(req,res){
  var username= req.body.username;
  var password = req.body.password;

  if(!username) {
    return res.status(401).send({ "message": "A username is required" });
  } else if(!password) {
    return res.status(401).send({ "message": "A password is required" });
  }

  req.db.query('CALL register(?, ?)', [username, password], function (error, result, fields) {
    if (error) {
      if (error.code == "ER_DUP_ENTRY") {
        res.redirect("register");
      }

      // throw error;
      // res.send({
      //   "code": 400,
      //   "failed": "error ocurred"
      // })
    } else {
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
      console.log(error);
      // res.send({
      //   "code":400,
      //   "failed":"error occurred"
      // })
    } else {
      if (result.length > 0) {
        if (result[0].user_password == password) {
          req.session.user = result[0].username;
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