var babel       =  require('rollup-plugin-babel');
var eslint      = require('gulp-eslint');
var gulp        = require('gulp');
var jasmine     = require('gulp-jasmine');
var rename      = require('gulp-rename');
var replace     = require('gulp-replace');
var rollup      = require('rollup').rollup;
var runSequence = require('run-sequence');
var uglify      = require('gulp-uglify');

var libName = 'hound';

// Paths for tasks
var paths = {
  src: {
    js: 'src/**/*.js',
    mainEntryPoint: 'src/hound.js'
  },

  test: {
    unit: 'test/unit/**/*.test.js'
  },

  dist: {
    dir: 'dist',
    lib: {
      full: 'dist/' + libName + '.js',
      min:  libName + '.min.js'
    }
  }
};

// Lints Javascript code for errors
gulp.task('lint', function() {
  return gulp.src(paths.src.js)
    .pipe(eslint())
    .pipe(eslint.format());
});

// Build the library
gulp.task('dist', function(done) {
  rollup({
    entry: paths.src.mainEntryPoint,
    plugins: [
      babel({
        exclude: 'node_modules/**'
      })
    ]
  }).then(function(bundle) {
    return bundle.write({
      dest: paths.dist.lib.full,
      format: 'umd',
      moduleId: 'HoundJS',
      moduleName: 'HoundJS'
    });
  }).then(function() {
    gulp.src(paths.dist.lib.full)
      .pipe(uglify())
      .pipe(rename(paths.dist.lib.min))
      .pipe(gulp.dest(paths.dist.dir))
      .on('end', function(){ 
        done();
      });
  });
});

// Runs unit tests (via Jasmine)
gulp.task('test:unit', function() {
  return gulp.src(paths.test.unit)
    .pipe(jasmine());
});

// Runs all tests
gulp.task('test', function(done) {
  runSequence(
    'dist',
    'test:unit',
    done
  );
});

// Default task runs 'lint' and 'dist'
gulp.task('default', function(done) {
  runSequence(
    'lint',
    'dist',
    'test:unit',
    done
  )
});
