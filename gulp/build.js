'use strict';

var gulp = require('gulp');

var plugins = require('gulp-load-plugins')({
  pattern:['gulp-*', 'uglify-save-license']
});
var del = require('del');
var bowerFiles = require('main-bower-files');
var Q = require('q');

var paths = gulp.paths;

var pipes = {};

pipes.vendorScripts = function() {
  plugins.util.log('pipe vendorScripts');
  return gulp.src(bowerFiles())
  .pipe(plugins.filter(['**/*.js']))
  .pipe(plugins.order(['jquery.js', 'angular.js']));
};

// Build vendor less
pipes.vendorStyles = function() {
  plugins.util.log('pipe vendorStyles');
  return gulp.src('src/app/vendor.less')
  .pipe(plugins.less())
  .pipe(plugins.autoprefixer())
  .on('error', function handleError(err) {
    console.error(err.toString());
    this.emit('end');
  });
};

// minified names
pipes.minifiedFileName = function() {
  return plugins.rename(function(path){
    path.extname = '.min' + path.extname
  })
}

pipes.builtVendorScriptsDev = function() {
  plugins.util.log('pipe builtVendorScriptsDev');
  return pipes.vendorScripts()
  .pipe(gulp.dest(paths.distDev + '/' + paths.scripts));
};

pipes.builtVendorScriptsProd = function() {
  plugins.util.log('pipe builtVendorScriptsProd');
  return pipes.vendorScripts()
  .pipe(plugins.concat('vendors.min.js'))
  .pipe(plugins.uglify({preserveComments:plugins.uglifySaveLicense}))
  .pipe(gulp.dest(paths.distProd + '/' + paths.scripts));
};

// Deploy vendor css to dev folder
pipes.builtVendorStylesDev = function() {
  plugins.util.log('pipe builtVendorStylesDev');
  return gulp.src('src/app/vendor.less')
  .pipe(plugins.less())
  .pipe(plugins.autoprefixer())
  .on('error', function handleError(err) {
    console.error(err.toString());
    this.emit('end');
  })
  .pipe(gulp.dest(paths.distDev + '/' + paths.styles));
};

// Deploy vendor css to prod folder
pipes.builtVendorStylesProd = function() {
  plugins.util.log('pipe builtVendorStylesProd');
  return gulp.src('src/app/vendor.less')
  .pipe(plugins.sourcemaps.init())
  .pipe(plugins.less())
  .pipe(plugins.autoprefixer())
  .on('error', function handleError(err) {
    console.error(err.toString());
    this.emit('end');
  })
  .pipe(plugins.minifyCss())
  .pipe(plugins.sourcemaps.write())
  .pipe(pipes.minifiedFileName())
  .pipe(gulp.dest(paths.distProd + '/' + paths.styles));
};

// Validate HTML Files
pipes.validatedHTML = function() {
  plugins.util.log('pipe validatedHTML');
  return gulp.src(paths.html)
  .pipe(plugins.htmlhint())
  .pipe(plugins.htmlhint.reporter());
};

// Inject the Files into HTML
pipes.injectDev = function() {
  plugins.util.log('pipe injectDev');
  return pipes.validatedHTML()
  .pipe(gulp.dest(paths.distDev))
  .pipe(plugins.inject(pipes.builtVendorScriptsDev(),{relative: true, name: 'bower'})) // Inject Vendor Scripts
  .pipe(plugins.inject(pipes.builtVendorStylesDev(),{relative: true, name: 'bower'})) // Inject Vendor Styles
  .pipe(gulp.dest(paths.distDev));
};

pipes.injectProd = function() {
  plugins.util.log('pipe injectProd');
  return pipes.validatedHTML()
  .pipe(gulp.dest(paths.distProd))
  .pipe(plugins.inject(pipes.builtVendorScriptsProd(),{relative: true, name: 'bower'})) // Inject Vendor Scripts
  .pipe(plugins.inject(pipes.builtVendorStylesProd(),{relative: true, name: 'bower'})) // Inject Vendor Styles
  .pipe(gulp.dest(paths.distProd));
};

// removes all compiled dev files
gulp.task('clean-dev', function() {
  var deferred = Q.defer();
  del(paths.distDev, function() {
    deferred.resolve();
  });
  return deferred.promise;
});

// removes all compiled production files
gulp.task('clean-prod', function() {
    var deferred = Q.defer();
    del(paths.distProd, function() {
        deferred.resolve();
    });
    return deferred.promise;
});

// moves vendor scripts into the dev environment
gulp.task('build-vendor-scripts-dev', ['clean-dev'], pipes.builtVendorScriptsDev);

// concatenates, uglifies, and moves vendor scripts into the prod environment
gulp.task('build-vendor-scripts-prod', ['clean-prod'], pipes.builtVendorScriptsProd);

// Build Scripts and Inject into HTML for Dev mode(no uglify etc.)
gulp.task('inject-dev', ['clean-dev'], pipes.injectDev);

// Build Scripts and Inject into HTML for Prod mode(uglify etc.)
gulp.task('inject-prod', ['clean-prod'], pipes.injectProd);
