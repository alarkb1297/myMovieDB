var db = require('./db').db;
var crypto = require('crypto')

// Encrypt the user password
hash = function(password) {
  return crypto.createHash('sha1').update(password).digest('base64');
}

// Register a new user in the database
exports.register = function(username, password, cb) {
  db.query('CALL register(?, ?)', [username, hash(password)], function (error, result, fields) {
    if (error) return cb(error);
    cb(null, result);
  });
}

// Check user credentials in the database to login
exports.login = function(username, password, cb) {
  db.query('SELECT * FROM movie_user WHERE username = ?', [username], function (error, result, fields) {
    if (error) cb(error);

    if (result.length > 0) {
      if (result[0].user_password == hash(password)) {
        cb(null, result[0].username);
      } else {
        cb("Username and pass do not match");
      }
    } else {
      cb("User not found");
    }
  });
}

// exports.changePassword