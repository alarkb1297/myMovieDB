// Middleware for checking to see if a user is logged in
exports.loggedIn = function(req, res, next) {
  if (!req.session.user) {
    res.send('You are not logged in.');
  } else {
    next();
  }
}

// Middleware for checking to see if a user has admin privileges
exports.isAdmin = function(req, res, next) {
  if (!req.session.user || (req.session.user && !req.session.user.isAdmin)) {
    res.send('You do not have administrator privileges.');
  } else {
    next();
  }
}