var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var concat = require('gulp-concat');
var cleanCss = require('gulp-clean-css');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var pump = require('pump');
var exec = require('child_process').exec;
var uglify = require('gulp-uglify');
var argv = require('yargs').argv;


gulp.task('server-dev', function() {
  nodemon({
    script: 'server.js',
    env: { 'NODE_ENV': 'development'}
  });
});

gulp.task('test', function() {
  return gulp.src('test/serverSpec.js')
      .pipe(mocha())
      .once('error', () => {
        process.exit(1);
      })
      .once('end', () => {
        process.exit();
      });
});

gulp.task('eslint', function() {
  return gulp.src(['**/*.js', '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError()); 

});

gulp.task('concat', function() {
  return gulp.src(['public/client/*.js'])
    .pipe(concat('client.min.js', {newLine: ';'}))
    .pipe(gulp.dest('public/dist/'));  
});

gulp.task('cssClean', function() {
  return gulp.src('public/style.css')
    .pipe(cleanCss({compatibility: 'ie8'}))
    .pipe(gulp.dest('public/dist'));
});

gulp.task('uglify', function (cb) {
  pump([
    gulp.src('public/dist/client.min.js'),
    uglify(),
    gulp.dest('public/dist')
  ],
    cb
  );
});

gulp.task('exec', function() {
  exec(['git add .',
          'git commit -m "PRODUCING SERVER WITH COMMIT"',
          'git push beta master'].join('&&'), function(err, stdout, stderr) {
  });
});


////////////////////////////////////////////////////
// Main gulp tasks
////////////////////////////////////////////////////

//asdf
gulp.task('build', [
  'eslint', 'concat', 'cssClean', 'uglify'
]);

gulp.task('deploy', function() {
  gulp.run('upload');
});

gulp.task('upload', function() {
  if (argv.env === 'prod') {
    gulp.run('exec');
  } else {
    gulp.run(['build', 'server-dev']);
  }
});


gulp.task('default', []);


