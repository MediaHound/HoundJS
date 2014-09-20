
var gulp    = require('gulp'),
    jshint  = require('gulp-jshint');


var paths = {

  src:   './src',
  build: './build',
  dist:  './dist',
  tests: './test'

};

paths.lint = {
  glob: paths.src + '/**/*.js',
  rc: './.jshintrc'
};


// JSHint Task
gulp.task('jshint', function(){

  return gulp.src(paths.lint.glob)
    .pipe(jshint(paths.lint.rc))
    .pipe(jshint.reporter('jshint-stylish'));

});


