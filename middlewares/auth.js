module.exports = function(req, res, next) {
  console.log(req.session.user);
  if (!req.session.user) {
    res.send('You are not logged in.');
    // res.status(401).end();
  } else {
    next();
  }
}
