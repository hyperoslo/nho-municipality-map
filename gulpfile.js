'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var clean = require('gulp-clean');
var prefix = require('gulp-autoprefixer');

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

gulp.task('pdf', function () {
  gulp.src(['./pdf/*.pdf'])
    .pipe(gulp.dest('./dist/pdf'))
});

gulp.task('js', function () {
  gulp.src(['./js/**/*.js'])
    .pipe(gulp.dest('./dist/js'))
});

gulp.task('sass', function () {
  gulp.src(['./sass/index.scss', './sass/ie9.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(prefix("last 1 version", "> 1%", "ie 8", "ie 7"))
    .pipe(sourcemaps.init())
      .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('watch', ['sass', 'fonts', 'images', 'js', 'pdf'], function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
  gulp.watch('./js/**/*.js', ['js']);
  gulp.watch('./**/*.html', ['html']);
  gulp.watch('./fonts/**/*.{eot,svg,ttf,woff,woff2}', ['fonts']);
  gulp.watch('./images/**/*.{jpg,jpeg,png,svg,gif}', ['images']);
});

gulp.task('server', function(cb) {
   var spawn = require('child_process').spawn;
   var log = function(data){ console.log("[Divshot] " + data.toString().trim()); }

   var server = spawn('divshot', ['server', '--port', '3000', '--host', '0.0.0.0']);

   server.on('error', function(error) { console.log(error.stack) });
   server.stdout.on('data', log);
   server.stderr.on('data', log);
});

gulp.task('default', ['clean'], function() {
  gulp.start(['watch']);
  gulp.start(['server']);
});
