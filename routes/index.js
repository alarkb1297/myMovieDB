var express = require('express');
var router = express.Router();
var connection = require('../connection.js');
var passwordHash = require('password-hash');

/* GET home page. */
router.get('/', function(req, res, next) {
    connection.query('SELECT * FROM users', function(err, results) {
        res.send(results);
    })
});
module.exports = router;
