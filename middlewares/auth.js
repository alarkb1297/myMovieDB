module.exports = function(req, res, next) {
  if (!req.session.user) {
    res.send('You are not logged in.');
    // res.status(401).end();
  } else {
    next();
  }
}