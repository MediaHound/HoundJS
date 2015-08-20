var gulp        = require('gulp'),
    jshint      = require('gulp-jshint'),
    concat      = require('gulp-concat'),
    replace     = require('gulp-replace'),
    uglify      = require('gulp-uglify'),
    rename      = require('gulp-rename'),
    jasmine     = require('gulp-jasmine'),
    runSequence = require('run-sequence'),
    execFile    = require('child_process').execFile;

var libName = 'houndjs'

// Paths for tasks
var paths = {
  src: {
    js: 'src/**/*.js',
    mainEntryPoint: 'src/hound-api.js'
  },

  build: {
    library: 'build/' + libName + '.build.js'
  },

  traceur: {
    binary: 'node_modules/traceur/traceur',
    runtime: 'node_modules/traceur/bin/traceur-runtime.js'
  },

  test: {
    unit: 'test/unit/**/*.test.js'
  },

  dist: {
    dir: 'dist',
    lib: {
      full: libName + '.js',
      min:  libName + '.min.js'
    }
  }
};

// Helper for executing shell commands
var execFileHelper = function(command, args, callback) {
  execFile(command, args, function(error, stdout, stderr) {
    if (stdout) {
      console.log('stdout: ' + stdout);
    }
    if (stderr) {
      console.log('stderr: ' + stderr);
    }
    if (error !== null) {
      console.log('err: ' + error);
    }
    callback();
  });
};

// Lints Javascript code for errors
gulp.task('lint', function() {
  return gulp.src(paths.src.js)
    .pipe(jshint('./.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
});

// Build the library
gulp.task('dist', function(done) {
  var traceurArgs = [
    paths.src.mainEntryPoint,
    '--out', paths.build.library,
    '--modules=bootstrap'
  ];
  execFileHelper(paths.traceur.binary, traceurArgs, function() {
    return gulp.src([paths.traceur.runtime, paths.build.library])
      .pipe(replace(/\.\.\/src\//g, ''))
      .pipe(replace(
        'System.get("hound-api.js" + \'\');',
        'if (typeof module !== \'undefined\' && typeof module.exports !== \'undefined\') { module.exports = System.get("hound-api.js" + \'\').default; }'))
      .pipe(concat(paths.dist.lib.full))
      .pipe(gulp.dest(paths.dist.dir))
      .pipe(uglify())
      .pipe(rename(paths.dist.lib.min))
      .pipe(gulp.dest(paths.dist.dir))
      .on('end', done)
      .on('error', done);
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
    'dist'
  )
});
