
var gulp    = require('gulp'),
    jshint  = require('gulp-jshint'),
    replace = require('gulp-replace'),
    exec    = require('child_process').exec;

var paths = {

  src:   './src',
  build: './build',
  dist:  './dist',
  tests: './test'

};

// JSHint Task
gulp.task('jshint', function(){

  return gulp.src(paths.src + '/**/*.js')
    .pipe(jshint('./.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));

});

var traceur = {
  dir: {
    'amd'         : './node_modules/traceur/traceur --dir src build/amd --modules=amd',
    'cjs'         : './node_modules/traceur/traceur --dir src build/cjs --modules=commonjs',
    'instantiate' : './node_modules/traceur/traceur --dir src build/instantiate --modules=instantiate'
  },
  single: {
    'amd'         :'./node_modules/traceur/traceur --out build/compiled/hound-api.amd.js src/hound-api.js --modules=amd',
    'cjs'         :'./node_modules/traceur/traceur --out build/compiled/hound-api.cjs.js src/hound-api.js --modules=commonjs',
    'instantiate' :'./node_modules/traceur/traceur --out build/compiled/hound-api.sysjs.js src/hound-api.js --modules=instantiate',
    'inline'      :'./node_modules/traceur/traceur --out build/compiled/hound-api.inline.js src/hound-api.js --modules=inline',
    'register'    :'./node_modules/traceur/traceur --out build/compiled/hound-api.register.js src/hound-api.js --modules=register'
  }
};

// Helper for executing traceur compiles
var execHelper = function(command, callback){
  exec(command, function(error, stdout, stderr){
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if( error !== null ){
      console.log(error);
    }
    callback();
  });
};

// Compile Traceur tasks
// Single File Compile
gulp.task('traceur:out:amd', function(done){
  execHelper(traceur.single.amd, done);
});
gulp.task('traceur:out:cjs', function(done){
  execHelper(traceur.single.cjs, done);
});
gulp.task('traceur:out:instantiate', function(done){
  execHelper(traceur.single.instantiate, done);
});
gulp.task('traceur:out:inline', function(done){
  execHelper(traceur.single.inline, done);
});
gulp.task('traceur:out:register', function(done){
  execHelper(traceur.single.register, done);
});
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
gulp.task('traceur:amd', function(done){
  execHelper(traceur.dir.amd, done);
});
gulp.task('traceur:cjs', function(done){
  execHelper(traceur.dir.cjs, done);
});
gulp.task('traceur:instantiate', function(done){
  execHelper(traceur.dir.instantiate, done);
});
gulp.task('traceur:build', ['traceur:amd', 'traceur:cjs', 'traceur:instantiate']);

gulp.task('build', ['traceur:build', 'traceur:out']);




gulp.task('replace:test', function(){

  return gulp.src('./build/compiled/hound-api.amd.js', {base:'./build/compiled/'})
    .pipe(replace(/(\.\.\/)*?src\/hound-api/g, 'hound-api'))
    .pipe(gulp.dest('./build/stripped/'));

});




// Concat-Replace-Compile
gulp.task('dist', function(done){

  // Concat files
  // remove imports

});



/*


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
