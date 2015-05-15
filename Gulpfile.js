
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

  traceur: './node_modules/traceur/traceur'

};
// More paths, using above paths
paths.srcGlob       = paths.src   + '/**/*.js';
paths.houndApiJs    = paths.src   + '/hound-api.js';
paths.buildCompiled = paths.build + '/compiled';

// Traceur command line commands
var traceurOpts = '--symbols';
var traceurCmds = {
  single: {
    register : paths.traceur + ' ' + paths.houndApiJs + ' --out ' + paths.buildCompiled + '/hound-api.register.js --modules=register' // <-- this is the important one that is used to build distribution right now
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
    if( stdout ){
      console.log('stdout: ' + stdout);
    }
    if( stderr ){
      console.log('stderr: ' + stderr);
    }
    if( error !== null ){
      console.log(error);
    }
    callback();
  });
};

// Distribution Tasks
// Compile-Concat-Write helper
var concatCompiled = function(){
  return gulp.src([
      './node_modules/traceur/bin/traceur-runtime.js',
      './build/compiled/hound-api.register.js'
    ])
      .pipe(replace(/\.\.\/\.\.\/src\//g, ''))
      .pipe(replace(
        'System.get("hound-api.js" + \'\');',
        'if (typeof module !== \'undefined\' && typeof module.exports !== \'undefined\') { module.exports = System.get("hound-api.js" + \'\').default; }'))
      .pipe(concat('hound-api.js'))
      .pipe(gulp.dest(paths.dist));
};

// Calls traceur command once
gulp.task('dist', function(done){
  execHelper(traceurCmds.single.register, function(){
    concatCompiled(done);
  });
});

gulp.task('default', ['dist', 'jshint']);
