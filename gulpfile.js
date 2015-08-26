var
  _ = require('underscore'),
  browserify = require('browserify'),
  browserifyHandlebars = require('browserify-handlebars'),
  buffer = require('vinyl-buffer'),
  concat = require('gulp-concat'),
  depcheck = require('depcheck'),
  ghPages = require('gulp-gh-pages'),
  glob = require('glob').sync,
  gulp = require('gulp'),
  historyApiFallback = require('connect-history-api-fallback'),
  minifyCss = require('gulp-minify-css'),
  path = require('path'),
  rename = require('gulp-rename'),
  resolve = require('resolve'),
  source = require('vinyl-source-stream'),
  streamqueue = require('streamqueue'),
  uglify = require('gulp-uglify'),
  watchify = require('watchify');

var
  baseDir = './os-upload',
  distDir = baseDir + '/dist',
  frontendDependencies = _.keys(require('./package.json').dependencies),

  /* eslint-disable sort-vars */
  srcDir = baseDir + '/src',

  scriptsDir = srcDir + '/scripts',
  stylesDir = srcDir + '/styles',

  // Provide frontend app as a single bundle.
  bundler = browserify({
    cache       : {},
    debug       : true,
    entries     : [scriptsDir + '/app.js'],
    fullPaths   : true,
    packageCache: {},
    transform   : ['browserify-handlebars']
  });

 /*eslint-enable sort-vars */
// Don't include vendor dependencies in this bundle
bundler.external(frontendDependencies);

// Run and return the scripts pipeline on bundle
function scriptPipeline(bundle, outfile, options) {
  console.log('Bundling: ' + outfile);

  var
    outBundle = bundle.pipe(source(outfile)).pipe(buffer());

  if(options && options.uglify)
    outBundle = outBundle.pipe(uglify());

  return outBundle.pipe(gulp.dest(distDir));
}

// Provide frontend dependencies as a single bundle.
gulp.task('vendor-scripts', function() {
  var
    bundler = browserify({});

  frontendDependencies.forEach(function(id) { bundler.require(resolve.sync(id), {expose: id}); });
  return scriptPipeline(bundler.bundle(), 'vendor.min.js', {uglify: true});
});

gulp.task('app-scripts', function() {
  return scriptPipeline(bundler.bundle(), 'app.min.js', {uglify: true});
});

gulp.task('app-scripts-watched', function() {
  var
    watcher = watchify(bundler);

  watcher .on('update', function() { scriptPipeline(watcher.bundle(), 'app.min.js'); });
  return scriptPipeline(watcher.bundle(), 'app.min.js');
});

// List unused dependencies in stderr.
gulp.task('check-deps', function() {
  depcheck(path.resolve('./'), {withoutDev: false, ignoreDirs: ['dist', 'node_modules']}, function(U) {
    if(!_.isEmpty(U.dependencies))
      console.error('Unused dependencies: ', U.dependencies.join(', '));

    if(!_.isEmpty(U.devDependencies))
      console.error('Unused dev dependencies: ', U.devDependencies.join(', '));

    if(!_.isEmpty(U.invalidFiles))
      console.error('JS files that couldn\'t be parsed: ', U.invalidFiles.join(', '));
  });
});

// Provide frontend styles as a single bundle.
gulp.task('styles', function() {
  return streamqueue({objectMode: true}, gulp.src(stylesDir + '/app.css'))
    .pipe(concat('app.min.css'))
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(gulp.dest(distDir));
});

gulp.task('default', ['vendor-scripts', 'app-scripts', 'styles']);
gulp.task('dev', ['vendor-scripts', 'app-scripts-watched', 'styles']);
