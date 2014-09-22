
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


var traceurcmds = {
  'amd'         :'./node_modules/traceur/traceur --out build/compiled/hound-api.amd.js src/hound-api.js --modules=amd',
  'cjs'         :'./node_modules/traceur/traceur --out build/compiled/hound-api.cjs.js src/hound-api.js --modules=commonjs',
  'instantiate' :'./node_modules/traceur/traceur --out build/compiled/hound-api.sysjs.js src/hound-api.js --modules=instantiate',
  'inline'      :'./node_modules/traceur/traceur --out build/compiled/hound-api.inline.js src/hound-api.js --modules=inline',
  'register'    :'./node_modules/traceur/traceur --out build/compiled/hound-api.register.js src/hound-api.js --modules=register'
};


// JSHint Task
gulp.task('jshint', function(){

  return gulp.src(paths.lint.glob)
    .pipe(jshint(paths.lint.rc))
    .pipe(jshint.reporter('jshint-stylish'));

});


