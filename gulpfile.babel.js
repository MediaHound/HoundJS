import gulp        from 'gulp';

import babel       from 'gulp-babel';
import del         from 'del';
import eslint      from 'gulp-eslint';
import jasmine     from 'gulp-jasmine';
import runSequence from 'run-sequence';

// bundle-dist related
import babelify    from 'babelify';
import browserify  from 'browserify';
import buffer      from 'vinyl-buffer';
import source      from 'vinyl-source-stream';
import stripify    from 'stripify';
import transform   from 'vinyl-transform';
import uglify      from 'gulp-uglify';
import uglifyify   from 'uglifyify';

// Paths for tasks
const paths = {
  src: {
    js: 'src/**/*.js',
    entrypoint: 'src/hound.js'
  },

  dist: {
    root: 'dist/',
    exitpoint: 'hound.js'
  },

  test: {
    unit: 'test/unit/**/*.test.js'
  },

  lib: 'lib'
};

// Cleans output files
gulp.task('clean', done => {
  del([paths.dist.root, paths.lib])
    .then(function() {
      done();
    });
});

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

// Creates a distribution bundle via browserify
gulp.task('bundle-dist', () => {
  return browserify(paths.src.entrypoint)
    .transform(babelify)
    .transform(stripify)
    .transform(uglifyify)
    .bundle()
    .pipe(source(paths.dist.exitpoint))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist.root));
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
    'clean',
    'lint',
    ['build', 'bundle-dist'],
    'test:unit',
    done
  );
});
