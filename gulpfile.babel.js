import gulp        from 'gulp';

import babel       from 'gulp-babel';
import eslint      from 'gulp-eslint';
import jasmine     from 'gulp-jasmine';
import runSequence from 'run-sequence';

// Paths for tasks
const paths = {
  src: {
    js: 'src/**/*.js'
  },

  test: {
    unit: 'test/unit/**/*.test.js'
  },

  lib: 'lib'
};

// Lints Javascript code for errors
gulp.task('lint', () => {
  return gulp.src(paths.src.js)
    .pipe(eslint())
    .pipe(eslint.format());
});

// Compiles ES6 to ES5
gulp.task('build', () => {
  return gulp.src(paths.src.js)
    .pipe(babel())
    .pipe(gulp.dest(paths.lib));
});

// Runs unit tests (via Jasmine)
gulp.task('test:unit', () => {
  return gulp.src(paths.test.unit)
    .pipe(jasmine());
});

// Runs all tests
gulp.task('test', done => {
  runSequence(
    'build',
    'test:unit',
    done
  );
});

// Default task runs 'lint' and 'build'
gulp.task('default', done => {
  runSequence(
    'lint',
    'build',
    'test:unit',
    done
  );
});
