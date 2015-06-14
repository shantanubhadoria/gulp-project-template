'use strict';

var gulp = require('gulp');

var plugins = require('gulp-load-plugins')();
var del = require('del');
var bowerFiles = require('main-bower-files');
var Q = require('q');

var paths = gulp.paths;

var pipes = {};

pipes.vendorScripts = function() {
  return gulp.src(bowerFiles())
  .pipe(plugins.filter(['**/*.js']))
  .pipe(plugins.order(['jquery.js', 'angular.js']));
};

pipes.builtVendorScriptsDev = function() {
  return pipes.vendorScripts()
  .pipe(gulp.dest('dist.dev/vendors'));
};

pipes.builtVendorScriptsProd = function() {
  return pipes.vendorScripts()
//  .pipe(plugins.concat('vendors.min.js'))
//  .pipe(plugins.uglify())
  .pipe(gulp.dest(paths.distProd + '/' + paths.scripts));
};

// Validate HTML Files
pipes.validatedHTML = function() {
  var injectScripts = gulp.src(paths.html)
  .pipe(plugins.htmlhint())
  .pipe(plugins.htmlhint.reporter());
};

//
pipes.injectProd = function() {
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

gulp.task('inject-prod', ['build-vendor-scripts-prod'], pipes.injectProd);
