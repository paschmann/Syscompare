var gulp = require('gulp');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var del = require('del');
var runSequence = require('run-sequence');

gulp.task('build', function (callback) {
  runSequence('clean:dist', 
    ['clean:dist', 'scripts', 'images', 'fonts', 'xsjslib', 'tests'],
    callback
  )
});

gulp.task('scripts', function(){
  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

gulp.task('images', function(){
  return gulp.src('app/img/**/*.+(png|jpg|jpeg|gif|svg)')
  .pipe(imagemin({
      // Setting interlaced to true
      interlaced: true
    }))
  .pipe(gulp.dest('dist/img'))
});

gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
});

gulp.task('xsjslib', function() {
  return gulp.src('app/lib/**/*')
  .pipe(gulp.dest('dist/lib'))
});

gulp.task('tests', function() {
  return gulp.src('app/tests/**/*')
  .pipe(gulp.dest('dist/tests'))
});

gulp.task('clean:dist', function() {
  return del.sync('dist');
});