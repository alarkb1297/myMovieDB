var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Movies = require('../models/movie');
var auth = require('../middlewares/auth');

// Set up routing for subpages
router.use('/', require('./users'));
router.use('/movie', require('./movies'));
router.use('/actor', require('./actors'));
router.use('/', require('./search'));

// GET home page.
router.get('/', function (req, res, next) {

    Movies.getTopMovies(function (err, result) {
        if (err) {
            return res.send({
                "code": 400,
                "failed": "error occurred"
            });
        }
        else {
            var movies = result;
        }

        res.render('index', { title: 'MyMovieDB', movies: movies, retry: req.query.retry});
    });

});

module.exports = router;
