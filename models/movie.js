var db = require('./db').db;

// Get data about a movie entry
exports.get = function(movie_id, cb) {
  db.query('CALL movie_info(?)', [movie_id], function (error, result, fields) {
    if (error) return cb(error);
    cb(null, result);
  });
}

// Add movie to the database
exports.addMovie = function(movie, cb) {
  db.query('call add_movie(?, ?, ?, ?, ?, ?)',
    [movie.title, movie.director, movie.year, movie.genre, movie.summary, movie.trailer],
    function (error, result, fields) {
      if (error) return cb(error);
      cb (null, result[0][0].movie_id);
    }
  );
}

// Edit a particular movie in the database
exports.editMovie = function(movie, cb) {
  db.query('call edit_movie(?, ?, ?, ?, ?, ?, ?)',
    [movie.id, movie.title, movie.director, movie.year, movie.genre, movie.summary, movie.trailer],
    function (error, result, fields) {
      if (error) return cb(error);
      cb (null, movie.id);
    }
  );
}

// Add roles to a particular movie
exports.addRoles = function (movie_id, roles, cb) {
  function addOne(role) {
    if (!role) return cb(null, movie_id);
    db.query('CALL add_role(?, ?, ?)', [movie_id, role.actor, role.name], function (error, result, fields) {
      if (error) return cb(error);
      else addOne(roles.shift());
    });
  }

  addOne(roles.shift());
}

// Edit roles in the database.
exports.editRoles = function (movie_id, roles, cb) {
  db.query("DELETE FROM roles WHERE movie_id = ?", [movie_id], function (error, result, fields) {
    if (error) return cb(error);
    exports.addRoles(movie_id, roles, function(err, success) {
      if (err) return cb(err);
      return cb(null, movie_id);
    });
  });
}

// Add a rating value for a particular movie by a user
exports.rate = function(movie_id, value, username, cb) {
  db.query('CALL rate(?, ?, ?)', [movie_id, value, username], function (error, result, fields) {
    if (error) return cb(error);
    cb(null, true);
  });
}

// Get the set of reviews for a movie
exports.getReviews = function (movie_id, cb) {
  db.query('select review_text, username from reviews where movie_id = ?', [movie_id], function (error, result, fields) {
    if (error) return cb(error);
    cb (null, result);
  });
}

// Add a new review to a movie
exports.addReview = function (movie_id, username, review, cb) {
  db.query('insert into reviews (movie_id, username, review_text) value (?, ?, ?)', [movie_id, username, review],
    function (error, result, fields) {
      if (error) return cb(error);
      cb (null, true);
    });
}

// Get the set of top movies for the range
exports.getTopMovies = function(limit, startDate, endDate, cb) {
  db.query('call get_popular_movies(?, ?, ?)', [limit, startDate, endDate], function (error, result, fields) {
    if (error) return cb(error);
    cb(null, result[0]);
  });
}

// Delete a movie from the database
exports.deleteMovie = function(movie, cb) {
  db.query('DELETE FROM movies WHERE movie_id = ?', [movie], function (error, result, fields) {
    if (error) return cb(error);
    cb (null, true);
  });
}


