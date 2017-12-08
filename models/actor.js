var db = require('./db').db;

// Get data about a movie entry
exports.get = function(actor_id, cb) {
  db.query('CALL actor_info(?)', [actor_id], function (error, result, fields) {
    if (error) return cb(error);
    cb(null, result);
  });
}

// Add an actor to the database
exports.addActor = function(actor, cb) {
  db.query('CALL add_actor(?, ?, ?, ?, ?)',
    [actor.name, actor.dob, actor.bio, actor.height, actor.birthplace], function (error, result, fields) {
      if (error) return cb(error);
      cb(null, result[0][0].actor_id);
  });
}

// Edit a particular actor's values
exports.editActor = function(actor, cb) {
  db.query('CALL edit_actor(?, ?, ?, ?, ?, ?)',
    [actor.id, actor.name, actor.dob, actor.bio, actor.height, actor.birthplace], function (error, result, fields) {
      if (error) return cb(error);
      cb (null, actor.id);
  });
}

// Delete an actor from the database
exports.deleteActor = function(actor, cb) {
  db.query('DELETE FROM actor WHERE actor_id = ?', [actor], function (error, result, fields) {
    if (error) return cb(error);
    cb (null, true);
  });
}