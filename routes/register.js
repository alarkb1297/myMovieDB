var express = require('express');
var router = express.Router();

/* GET register page. */
router.get('/', function (req, res, next) {
  res.render('register', { title: 'MyMovieDB', retry: req.param('retry') });
});

//
// /* POST to register user */
// router.post('/adduser', login.register);

// The current implementation is super janky, but it works.
// I plan on revisiting it to make it a bit more streamlined
// and usable. Here are the links for the tutorials I used:
// https://closebrace.com/tutorials/2017-03-02/the-dead-simple-step-by-step-guide-for-front-end-developers-to-getting-up-and-running-with-nodejs-express-and-mongodb
// https://medium.com/technoetics/handling-user-login-and-registration-using-nodejs-and-mysql-81b146e37419

// I may end up implementing sessions
// https://blog.couchbase.com/creating-user-profile-store-with-node-js-nosql-database/

// Another helpful link
// https://stackoverflow.com/questions/7990890/how-to-implement-login-auth-in-node-js
module.exports = router;
