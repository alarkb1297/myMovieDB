exports.loggedIn = function(req, res, next) {
  if (!req.session.user) {
    res.send('You are not logged in.');
  } else {
    next();
  }
}

exports.isAdmin = function(req, res, next) {
  if (!req.session.user || (req.session.user && !req.session.user.isAdmin)) {
    res.send('You do not have administrator privileges.');
  } else {
    next();
  }
}