var
  _ = require('underscore'),
  browserify = require('browserify'),

  /* eslint-disable no-unused-vars */
  browserifyHandlebars = require('browserify-handlebars'),

  /* eslint-enable no-unused-vars */
  buffer = require('vinyl-buffer'),
  concat = require('gulp-concat'),
  depcheck = require('depcheck'),
  gulp = require('gulp'),
  less = require('gulp-less'),
  minifyCss = require('gulp-minify-css'),
  path = require('path'),
  prefixer = require('gulp-autoprefixer'),
  rename = require('gulp-rename'),
  resolve = require('resolve'),
  source = require('vinyl-source-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  streamqueue = require('streamqueue'),
  uglify = require('gulp-uglify'),
  watchify = require('watchify');

var
  baseDir = './os-import',
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
    vendorBundler = browserify({});

  frontendDependencies.forEach(function(id) { vendorBundler.require(resolve.sync(id), {expose: id}); });
  return scriptPipeline(vendorBundler.bundle(), 'vendor.min.js', {uglify: true});
});

gulp.task('app-scripts', function() {
  return scriptPipeline(bundler.bundle(), 'app.min.js', {uglify: true});
});

gulp.task('app-scripts-watched', function() {
  var
    watcher = watchify(bundler);

  watcher.on('update', function() { scriptPipeline(watcher.bundle(), 'app.min.js'); });
  return scriptPipeline(watcher.bundle(), 'app.min.js');
});

// List unused dependencies in stderr.
gulp.task('check-deps', function() {
  depcheck(path.resolve('./'), {withoutDev: false, ignoreDirs: ['dist', 'node_modules']}, function(unused) {
    if(!_.isEmpty(unused.dependencies))
      console.error('Unused dependencies: ', unused.dependencies.join(', '));

    if(!_.isEmpty(unused.devDependencies))
      console.error('Unused dev dependencies: ', unused.devDependencies.join(', '));

    if(!_.isEmpty(unused.invalidFiles))
      console.error('JS files that couldn\'t be parsed: ', unused.invalidFiles.join(', '));
  });
});

gulp.task('copy-static', function() {
  return gulp.src([path.join(baseDir, 'src', 'static', '/**/*')]).pipe(gulp.dest(distDir));
});

gulp.task('landing-scripts', function() {
  return scriptPipeline(browserify({
    cache       : {},
    entries     : [scriptsDir + '/components/ui/landing.js'],
    fullPaths   : true,
    packageCache: {}
  }).bundle(), 'landing.min.js', {uglify: true});
});

// Provide frontend styles as a single bundle.
gulp.task('styles', function() {
  // Style files dir structure may be comlicated, pick manually files to be compiled
  gulp.src([path.join(stylesDir, 'app.less'), path.join(stylesDir, 'landing.less')])
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(prefixer({browsers: ['last 4 versions']}))
    .pipe(sourcemaps.write())
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(distDir));
});

gulp.task('default', ['vendor-scripts', 'app-scripts', 'landing-scripts', 'styles', 'copy-static']);
gulp.task('dev', ['vendor-scripts', 'app-scripts-watched', 'landing-scripts', 'styles', 'copy-static']);
