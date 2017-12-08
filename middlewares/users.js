var user = require('../models/user');

// Middeleware for passing the authenticated user info between requests
module.exports = function(req, res, next) {
  res.locals.session = req.session;
  next();
};
