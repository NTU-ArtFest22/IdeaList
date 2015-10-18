'use strict';

var gulp = require('gulp');
var livereload = require('gulp-livereload');
var nodemon = require('gulp-nodemon');
var watch = require('gulp-watch');

gulp.task('css', function() {
  gulp.src('public/css/*.css')
    .pipe(watch())
    .pipe(livereload());
});

gulp.task('js', function() {
  gulp.src('public/js/**/*.js')
    .pipe(watch())
    .pipe(livereload());
});

gulp.task('haml', function() {
  gulp.src('views/**/*.haml')
    .pipe(watch())
    .pipe(livereload());
});

gulp.task('develop', function() {
  nodemon({
    script: 'develop.js',
    ext: 'js json'
  });
});
gulp.task('default', ['develop', 'css', 'haml', 'js']);