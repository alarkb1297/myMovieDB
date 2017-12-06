var db = require('./db').db;

// Get data about a movie entry
exports.get = function(movie_id, cb) {
  db.query('CALL movie_info(?)', [movie_id], function (error, result, fields) {
    if (error) return cb(error);
    cb(null, result);
  });
}

exports.rate = function(movie_id, value, username, cb) {
  db.query('CALL rate(?, ?, ?)', [movie_id, value, username], function (error, result, fields) {
    console.log(error);
    if (error) return cb(error);
    cb(null, true);
  });
}

// get saved movies
exports.getTopMovies = function(cb) {
    db.query('call get_popular_movies()', function (error, result, fields) {
      if (error) return cb(error);
      cb(null, result[0]);
    });
}


// Add movie to db
exports.addMovie = function(movie, cb) {
  db.query('call add_movie(?, ?, ?, ?, ?, ?)',
    [movie.title, movie.director, movie.year, movie.genre, movie.summary, movie.trailer],
    function (error, result, fields) {
      if (error) return cb(error);
      cb (null, result[0][0].movie_id);
    }
  );
}

exports.editMovie = function(movie, cb) {
  db.query('call edit_movie(?, ?, ?, ?, ?, ?, ?)',
    [movie.id, movie.title, movie.director, movie.year, movie.genre, movie.summary, movie.trailer],
    function (error, result, fields) {
      if (error) return cb(error);
      cb (null, movie.id);
    }
  );
}

exports.deleteMovie = function(movie, cb) {
  db.query('DELETE FROM movies WHERE movie_id = ?', [movie], function (error, result, fields) {
      if (error) return cb(error);
      cb (null, true);
    }
  );
}
