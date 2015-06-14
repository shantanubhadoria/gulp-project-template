'use strict';

var gulp = require('gulp');

gulp.paths = {
	html: 'src/*.html',
	distDev: 'dist.dev',
	distProd: 'dist.prod',
  scripts: 'scripts',
	tmp: '.tmp'
};

require('require-dir')('./gulp');
gulp.task('default', function() {
	gulp.start('build');
});
