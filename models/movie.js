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
    if (error) return cb(error);
    cb(null, true);
  });
}

// get saved movies
exports.getTopMovies = function(limit, startDate, endDate, cb) {
    db.query('call get_popular_movies(?, ?, ?)', [limit, startDate, endDate], function (error, result, fields) {
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
    });
}

exports.getReviews = function (movie_id, cb) {
    db.query('select review_text, username from reviews where movie_id = ?', [movie_id], function (error, result, fields) {
        if (error) return cb(error);
        cb (null, result);
    })
}

exports.addReview = function (movie_id, username, review, cb) {
    db.query('insert into reviews (movie_id, username, review_text) value (?, ?, ?)', [movie_id, username, review],
        function (error, result, fields) {
        if (error) return cb(error);
        cb (null, true);
    });
}