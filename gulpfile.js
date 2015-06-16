'use strict';

var gulp = require('gulp');

gulp.paths = {
	html: 'src/index.html',
	distDev: 'dist.dev',
	distProd: 'dist.prod',
  scripts: 'scripts',
  styles: 'styles',
	tmp: '.tmp'
};

require('require-dir')('./gulp');
gulp.task('default', function() {
	gulp.start('build');
});
