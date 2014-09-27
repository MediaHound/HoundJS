
var gulp    = require('gulp'),
    gulpif  = require('gulp-if'),
    jshint  = require('gulp-jshint'),
    concat  = require('gulp-concat'),
    replace = require('gulp-replace'),
    uglify  = require('gulp-uglify'),
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

// Options for Uglify Task
var uglifyOpts = {

  mangle: false,
  warnings: false

};

// Traceur command line commands
var traceurCmds = {
  dir: {
    'amd'         : paths.traceur + ' --dir ' + paths.src + ' ' + paths.build + '/amd --modules=amd',
    'cjs'         : paths.traceur + ' --dir ' + paths.src + ' ' + paths.build + '/cjs --modules=commonjs',
    'instantiate' : paths.traceur + ' --dir ' + paths.src + ' ' + paths.build + '/instantiate --modules=instantiate'
  },
  single: {
    'amd'         : paths.traceur + ' ' + paths.houndApiJs + ' --out ' + paths.buildCompiled + '/hound-api.amd.js --modules=amd',
    'cjs'         : paths.traceur + ' ' + paths.houndApiJs + ' --out ' + paths.buildCompiled + '/hound-api.cjs.js --modules=commonjs',
    'instantiate' : paths.traceur + ' ' + paths.houndApiJs + ' --out ' + paths.buildCompiled + '/hound-api.sysjs.js --modules=instantiate',
    'inline'      : paths.traceur + ' ' + paths.houndApiJs + ' --out ' + paths.buildCompiled + '/hound-api.inline.js --modules=inline',
    'register'    : paths.traceur + ' ' + paths.houndApiJs + ' --out ' + paths.buildCompiled + '/hound-api.register.js --modules=register' // <-- this is the important one that is used to build distribution right now
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

// Compile Traceur tasks
// Single File Compile
gulp.task('traceur:out:amd',          function(done){ execHelper(traceurCmds.single.amd, done); });
gulp.task('traceur:out:cjs',          function(done){ execHelper(traceurCmds.single.cjs, done); });
gulp.task('traceur:out:instantiate',  function(done){ execHelper(traceurCmds.single.instantiate, done); });
gulp.task('traceur:out:inline',       function(done){ execHelper(traceurCmds.single.inline, done); });
gulp.task('traceur:out:register',     function(done){ execHelper(traceurCmds.single.register, done); });
// Aggregate for above tasks
gulp.task('traceur:out',
  [
    'traceur:out:amd',
    'traceur:out:cjs',
    'traceur:out:instantiate',
    'traceur:out:inline',
    'traceur:out:register'
  ]
);

// Directory Compile
gulp.task('traceur:dir:amd',          function(done){ execHelper(traceurCmds.dir.amd, done); });
gulp.task('traceur:dir:cjs',          function(done){ execHelper(traceurCmds.dir.cjs, done); });
gulp.task('traceur:dir:instantiate',  function(done){ execHelper(traceurCmds.dir.instantiate, done); });
// Aggregate for above tasks
gulp.task('traceur:dir',
  [
    'traceur:dir:amd',
    'traceur:dir:cjs',
    'traceur:dir:instantiate'
  ]
);

// Run All Above Compile Tasks
gulp.task('build', ['traceur:dir', 'traceur:out']);
gulp.task('build:watch', function(done){
  gulp.watch(paths.srcGlob, ['build']);
  done();
});


// Distribution Tasks
// Compile-Concat-Write helper
var concatCompiled = function(minify, done){
  gulp.src([
      './node_modules/traceur/bin/traceur-runtime.js',
      './build/compiled/hound-api.register.js'
    ])
      .pipe(replace(/\.\.\/\.\.\/src\//g, ''))
      .pipe(gulpif(minify, concat('hound-api.min.js'), concat('hound-api.js')))
      .pipe(gulpif(minify, uglify(uglifyOpts)))
      .pipe(gulp.dest(paths.dist));
  done();
};

gulp.task('dist:browser:full', function(done){
  execHelper(traceurCmds.single.register, function(){
    concatCompiled(false, done);
  });
});

gulp.task('dist:browser:min', function(done){
  execHelper(traceurCmds.single.register, function(){
    concatCompiled(true, done);
  });
});

// Calls traceur command once, then compiles both min and non-min dist versions
gulp.task('dist:browser', function(done){
  var trulyDone = (function(){
    var count = 0;
    return function(){
      if( ++count >= 2 ){
        done();
      }
    };
  })();
  execHelper(traceurCmds.single.register, function(){
    concatCompiled(false, trulyDone);
    concatCompiled(true, trulyDone);
  });
});


// TODO Add compile for Node Distribution (requires removing window calls in api)
gulp.task('dist', ['dist:browser']);
gulp.task('default', ['jshint', 'dist']);

/*
FROM ORIGINAL REPO

 var gulp      = require('gulp'),
 plumber   = require('gulp-plumber'),
 concat    = require('gulp-concat'),
 uglify    = require('gulp-uglify'),
 traceur   = require('gulp-traceur'),
 paths     = require('../config.paths.js'),

 // Paths
 root      = paths.rootDir,
 tPaths    = paths.traceur,

 // Options
 options = {
 modules: 'amd',
 //'block-binding':true,
 experimental:true
 },
 uglifyjs = {
 mangle: false,
 'screw-ie8': true,
 compress: true
 };

 // Default tracer task is 'traceur:dev'
 gulp.task('traceur', ['traceur:dev']);

 // Traceur Compile for dev
 gulp.task('traceur:dev', function(){
 return gulp.src(tPaths.concat, {cwd: root})
 .pipe(plumber())
 .pipe(concat(tPaths.output)) // takes concat'd filename in
 .pipe(traceur(options))
 .pipe(gulp.dest(tPaths.dev));
 });
 // Dev compile to min
 gulp.task('traceur:dev:min', function(){
 return gulp.src(tPaths.concat, {cwd: root})
 .pipe(plumber())
 .pipe(concat(tPaths.output))
 .pipe(traceur(options))
 .pipe(uglify(uglifyjs))
 .pipe(gulp.dest(tPaths.dev));
 });


 // Traceur Compile for prod
 gulp.task('traceur:prod', function(){
 return gulp.src(tPaths.concat, {cwd: root})
 .pipe(plumber())
 .pipe(concat(tPaths.output))
 .pipe(traceur(options))
 .pipe(uglify(uglifyjs))
 .pipe(gulp.dest(tPaths.prod));
 });


 // Traceur Watch
 gulp.task('traceur:watch', function(){
 gulp.watch(tPaths.glob, ['traceur:dev']);
 });



 // Traceur
traceur: {
  glob:   'app/hound/model-es6/ ** /*.js',
  output: 'model-compiled.js',
    dev:    devDir  + '/hound',
    prod:   prodDir + '/hound',
    concat: (function(list){
    return list.map(function(s){ return 'app/hound/model-es6/'+s; });
  }([
    'setup-model.js',
    'source/MHSourceFormat.js',
    'source/MHSourceMethod.js',
    'source/MHSourceMedium.js',
    'source/MHSourceModel.js',
    'internal/MHCache.js',
    'social/MHSocial.js',
    'base/MHEmbeddedObject.js',
    'base/MHEmbeddedRelation.js',
    'base/MHRelationalPair.js',
    'base/MHObject.js',
    'image/MHImage.js',
    'trait/MHTrait.js',
    'trait/MHTraitGroup.js',
    'user/MHUser.js',
    'user/MHLoginSession.js',
    'collection/MHCollection.js',
    'contributor/MHContributor.js',
    'contributor/MHRealIndividualContributor.js',
    'contributor/MHRealGroupContributor.js',
    'contributor/MHFictionalIndividualContributor.js',
    'contributor/MHFictionalGroupContributor.js',
    'media/MHMedia.js',
    'media/MHAlbum.js',
    'media/MHAlbumSeries.js',
    'media/MHAnthology.js',
    'media/MHBook.js',
    'media/MHBookSeries.js',
    'media/MHComicBook.js',
    'media/MHComicBookSeries.js',
    'media/MHGame.js',
    'media/MHGameSeries.js',
    'media/MHGraphicNovel.js',
    'media/MHGraphicNovelSeries.js',
    'media/MHMovie.js',
    'media/MHMovieSeries.js',
    'media/MHMusicVideo.js',
    'media/MHNovella.js',
    'media/MHPeriodical.js',
    'media/MHPeriodicalSeries.js',
    'media/MHShowEpisode.js',
    'media/MHShowSeason.js',
    'media/MHShowSeries.js',
    'media/MHSong.js',
    'media/MHSpecial.js',
    'media/MHSpecialSeries.js',
    'media/MHTrailer.js',
    'action/MHAction.js',
    'action/MHAdd.js',
    'action/MHComment.js',
    'action/MHCreate.js',
    'action/MHLike.js',
    'action/MHFollow.js',
    'action/MHPost.js',
    'cleanup-model.js'
  ])
  )
}

 */
