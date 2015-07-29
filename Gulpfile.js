
var gulp    = require('gulp'),
    jshint  = require('gulp-jshint'),
    concat  = require('gulp-concat'),
    replace = require('gulp-replace'),
    exec    = require('child_process').exec;

// Paths for tasks
var paths = {
  src:   './src',
  build: './build',
  dist:  './dist',
  test: './test',

  libname: 'houndjs',

  traceur: './node_modules/traceur/traceur',
  traceurRuntime: './node_modules/traceur/bin/traceur-runtime.js'
};

// More paths, using above paths
paths.srcGlob           = paths.src   + '/**/*.js';
paths.mainEntryPoint    = paths.src   + '/hound-api.js';
paths.buildCompiled     = paths.build + '/compiled';

// Traceur command line commands
var traceurCmds = {
  single: {
    register : paths.traceur + ' ' + paths.mainEntryPoint + ' --out ' + paths.buildCompiled + '/' + paths.libname + '.register.js --modules=register'
  }
};

// JSHint Task
gulp.task('jshint', function(){
  return gulp.src(paths.srcGlob)
    .pipe(jshint('./.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
});

// JSHint Watch
gulp.task('jshint:watch', function(done){
  gulp.watch(paths.srcGlob, ['jshint']);
  done();
});

// Watch srcGlob do 'jshint', 'dist'
gulp.task('watch', function(){
  gulp.watch(paths.srcGlob, ['dist', 'jshint']);
});

// Helper for executing traceur compiles
var execHelper = function(command, callback){
  exec(command, function(error, stdout, stderr){
    if (stdout) {
      console.log('stdout: ' + stdout);
    }
    if (stderr) {
      console.log('stderr: ' + stderr);
    }
    if (error !== null) {
      console.log(error);
    }
    callback();
  });
};

// Distribution Tasks
// Compile-Concat-Write helper
var concatCompiled = function(){
  return gulp.src([
      paths.traceurRuntime,
      paths.buildCompiled + '/' + paths.libname + '.register.js'
    ])
      .pipe(replace(/\.\.\/\.\.\/src\//g, ''))
      .pipe(replace(
        'System.get("hound-api.js" + \'\');',
        'if (typeof module !== \'undefined\' && typeof module.exports !== \'undefined\') { module.exports = System.get("hound-api.js" + \'\').default; }'))
      .pipe(concat(paths.libname + '.js'))
      .pipe(gulp.dest(paths.dist));
};

// Calls traceur command once
gulp.task('dist', function(done){
  execHelper(traceurCmds.single.register, function(){
    concatCompiled(done);
  });
});

gulp.task('default', ['dist', 'jshint']);
