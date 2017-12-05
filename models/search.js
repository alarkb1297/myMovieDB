var db = require('./db').db;

// Search database for the desired keyword
exports.search = function(keyword, type, cb) {
  db.query('CALL search(?, ?)', [keyword, type], function (error, result, fields) {
    if (error) return cb(error);
    cb(null, result);
  });
}