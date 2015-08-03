'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var clean = require('gulp-clean');

gulp.task('clean', function () {
    return gulp.src(['./dist/', './tmp/'], {read: false})
        .pipe(clean({force: true}));
});

gulp.task('images', function () {
  gulp.src(['./images/**/*.{jpg,jpeg,png,svg,gif}'])
    .pipe(gulp.dest('./dist/images'))
});

gulp.task('fonts', function () {
  gulp.src(['./fonts/**/*.{eot,svg,ttf,woff,woff2}'])
    .pipe(gulp.dest('./dist/fonts'))
});

gulp.task('html', function () {
  gulp.src(['./*.html'])
    .pipe(gulp.dest('./dist'))
});

gulp.task('js', function () {
  gulp.src(['./js/**/*.js'])
    .pipe(gulp.dest('./dist/js'))
});

gulp.task('sass', function () {
  gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(sourcemaps.init())
      .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('watch', ['sass', 'fonts', 'images', 'js'], function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
  gulp.watch('./js/**/*.js', ['js']);
  gulp.watch('./**/*.html', ['html']);
  gulp.watch('./fonts/**/*.{eot,svg,ttf,woff,woff2}', ['fonts']);
  gulp.watch('./images/**/*.{jpg,jpeg,png,svg,gif}', ['images']);
});

gulp.task('default', ['clean'], function() {
  gulp.start(['watch']);
});
