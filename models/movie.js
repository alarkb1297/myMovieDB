var db = require('./db').db;

// Get data about a movie entry
exports.get = function(movie_id, cb) {
  db.query('CALL movie_info(?)', [movie_id], function (error, result, fields) {
    if (error) return cb(error);
    cb(null, result);
  });
}