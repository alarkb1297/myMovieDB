var db = require('./db').db;

// Get data about a movie entry
exports.get = function(actor_id, cb) {
  db.query('CALL actor_info(?)', [actor_id], function (error, result, fields) {
    if (error) return cb(error);
    cb(null, result);
  });
}
