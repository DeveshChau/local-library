var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Genre.
exports.genre_list = function (req, res, next) {
    Genre.find()
        .sort([['name', 'ascending']])
        .exec((err, list_genre) => {
            if (err) {
                return next(err);
            }
            res.render('genre_list', { title: 'Genre List', genre_list: list_genre });
        })
};

// Display detail page for a specific Genre.
exports.genre_detail = function (req, res, next) {
    async.parallel({
        genre: function (calback) {
            Genre.findById(req.params.id)
                .exec(calback);
        },
        genre_books: function (calback) {
            Book.find({ genre: req.params.id })
                .exec(calback);
        }
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.genre === null) {
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err)
        }
        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books })
    });
};

// Display Genre create form on GET.
exports.genre_create_get = function (req, res) {
    res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post = [

    // Validate that the name field is not empty.
    body('name', 'Genre name required').trim().isLength({ min: 1 }),

    // Sanitize (escape) the name field.
    sanitizeBody('name').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        var genre = new Genre(
            { name: req.body.name }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.
            // Check if Genre with same name already exists.
            Genre.findOne({ 'name': req.body.name })
                .exec(function (err, found_genre) {
                    if (err) { return next(err); }

                    if (found_genre) {
                        // Genre exists, redirect to its detail page.
                        res.redirect(found_genre.url);
                    }
                    else {

                        genre.save(function (err) {
                            if (err) { return next(err); }
                            // Genre saved. Redirect to genre detail page.
                            res.redirect(genre.url);
                        });

                    }

                });
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res) {
    async.parallel({
        genre: function (calback) {
            Genre.findById(req.params.id)
                .exec(calback)
        },
        books: function (calback) {
            Book.find({ 'genre': req.params.id })
                .exec(calback)
        }
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.genre === null) {
            res.redirect('/catlog/genres');
        }
        res.render('genre_delete', { title: 'Genre Delete', genre_books: results.books, genre: results.genre });
    })
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res) {
    async.parallel({
        genre: function (calback) {
            Genre.findById(req.params.id)
                .exec(calback)
        },
        books: function (calback) {
            Book.find({ 'genre': req.params.id })
                .exec(calback)
        }
    }, function (err, results) {
        if (err) {
            return next(err);
        }
        if (results.genre === null) {
            res.redirect('/catlog/genres');
        }
        if (results.books.length > 0) {
            res.render('genre_delete', { title: 'Genre Delete', genre_books: results.books, genre: results.genre });
            return;
        } else {
            Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
                if (err) { return next(err); }
                // Success - go to genre list
                res.redirect('/catalog/genres')
            })
        }
    })
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res) {
    Genre.findById(req.params.id)
        .exec(function (err, genre) {
            if (err) { return next(err) }
            if (genre === null) {
                var err = new Error('Genre Not Found')
                err.status = 404;
                return next(err);
            }
            res.render('genre_form', { title: 'Update Genre', genre: genre });
        })
};

// Handle Genre update on POST.
exports.genre_update_post = [
    body('name', 'Name can not be blank').trim().isLength({ min: 1 }),
    sanitizeBody('name').escape(),
    (req, res, next) => {
        const errors = validationResult(req)

        var genre = new Genre({
            name: req.body.name,
            _id: req.params.id
        })

        if (!errors.isEmpty()) {
            Genre.findById(req.params.id)
                .exec(function (err, genre) {
                    if (err) { return next(err) }
                    if (genre == null) {
                        var err = new Error('Genre Not Found')
                        err.status = 404;
                        return next(err);
                    }
                    res.render('genre_form', { title: 'Update Genre', genre: genre, errors: errors.array() });
                })
            return;
        } else {
            Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err, thegenre) {
                if (err) { return next(err) }
                res.redirect(thegenre.url);
            })
        }
    }
];