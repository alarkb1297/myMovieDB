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
    if (error) return cb(error);

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

// Check to see if a user has already saved the movie
exports.savedMovie = function(username, movie_id, cb) {
  db.query('SELECT check_if_saved(?, ?) AS isSaved', [username, movie_id], function (error, result, fields) {
    if (error) return cb(error);
    cb(null, !!result[0].isSaved);
  });
}

// Save a movie to a user's account
exports.saveMovie = function(username, movie_id, cb) {
  db.query('CALL toggle_save_movie(?, ?)', [username, movie_id], function (error, result, fields) {
    if (error) return cb(error);
    cb(null, true);
  });
}

// Get a user's saved movies
exports.getSavedMovies = function(username, cb) {
  db.query('select title, movies.movie_id ' +
            'from saved_movies join movies on saved_movies.movie_id = movies.movie_id ' +
              'where saved_movies.username = ?', [username], function (error, result, fields) {
      if (error) return cb(error);
      cb(null, result);
  });
}

// Check to see if a given user is an admin
exports.isAdmin = function(username, cb) {
    db.query('SELECT is_admin from movie_user where username = ?', [username], function (error, result, fields) {
        if (error) return cb(error);

        cb(null, !!result[0].is_admin);
    });
}