var gulp = require('gulp');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var del = require('del');
var runSequence = require('run-sequence');
const zip = require('gulp-zip');
var size = require('gulp-filesize');

gulp.task('build', function (callback) {
    runSequence(
        'clean', 
        'root',
        ['scripts', 'images', 'fonts', 'xsjslib', 'tests'],
        'createzip',
        callback
    )
});

gulp.task('root', function() {
    return gulp.src(['app/*.*'], { dot: true })
      .pipe(gulp.dest('dist/'))
});

gulp.task('scripts', function(){
    return gulp.src('app/*.html')
      .pipe(useref())
      .pipe(gulpIf('*.js', uglify()))
      .pipe(gulpIf('*.css', cssnano()))
      .pipe(gulp.dest('dist'))
});

gulp.task('images', function(){
    return gulp.src('app/img/**/*.+(png|jpg|jpeg|gif|svg)')
        .pipe(imagemin({
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

gulp.task('createzip', function(){
	return gulp.src('dist/**/*')
		.pipe(zip('syscompare.zip'))
        .pipe(size())
		.pipe(gulp.dest(''))
});

gulp.task('clean', function() {
    return del.sync(['dist', '.DS_Store', 'app/.DS_Store']);
});