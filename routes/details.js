
router.get('/:movie_title', function (req, res) {
    res.render('details', { title: 'MyMovieDB Details Page' })

    var title = req.params.movie_title

    console.log(title);

});