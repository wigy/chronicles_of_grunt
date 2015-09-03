/*
 * (C) 2015 Tommi Ronkainen
 *
 * Licenced under GPL-2.
 */

module.exports = function(grunt) {

	// Load modules.
	var path = require('path');

	// Known library copy specifications.
	var known = {
		lib: {
			coa: {src: 'node_modules/chronicles_of_angular/lib/**', dst: 'lib/chronicles_of_angular', drop: 'node_modules/chronicles_of_angular/lib'},
			jquery: {src: 'node_modules/jquery/dist/jquery.min.*', dst: 'lib', drop: 'node_modules/jquery/dist'},
			bootstrap: {src: 'node_modules/bootstrap/dist/js/bootstrap.min.js', dst: 'lib', drop: 'node_modules/bootstrap/dist/js'},
			angular: {src: 'node_modules/angular/angular.min.{js,js.map}', dst: 'lib', drop: 'node_modules/angular/'},
		},
		css: {
			bootstrap: {src: 'node_modules/bootstrap/dist/css/bootstrap.min.css', dst: 'css', drop: 'node_modules/bootstrap/dist/css/'},
		},
	};

	// Get the build configuration and set some variables.
	var config = grunt.config.get('build');
	if (!config) {
		grunt.fail.fatal("Cannot find configuration for build.");
	}

	var work_dir = config.options.work_dir || '.';

	// Helper functions for file handling.

	/**
     * Collect list of source file patterns and expand them to single files.
	 */
	function files(specs, category) {
		var ret = [];

		if (specs) {
			if (typeof(specs) == 'string') {
				if (specs in known[category]) {
					ret = ret.concat(files(known[category][specs], category));
				} else {
					grunt.fail.fatal("Unknown build file specification '" + specs +"' for '" + category + "'.");
				}
			} else if (specs instanceof Array) {
				for (var i = 0; i < specs.length; i++) {
					ret = ret.concat(files(specs[i], category));
				}
			} else if (typeof(specs) == 'object') {
				// Here we expand pattens from 'src' and combine them with 'dst'.
				var j;
				var src = grunt.file.expand(specs.src);
				for (j=0; j < src.length; j++) {
					var drop = specs.drop || 'node_modules';
					var file = {};
					file.src = src[j];
					if (grunt.file.isDir(file.src)) {
						continue;
					}
					var dst = src[j];
					if (dst.substr(0, drop.length) === drop) {
						dst = src[j].substr(drop.length);
					}
					file.dst = path.join(work_dir, specs.dst || category, dst);
					ret.push(file);
				}
			}
		}
		return ret;
	}

	// Build functions.
	var build = {

		info: function() {

			var matches;

			grunt.log.ok("Build: info");
			grunt.log.ok("");
			grunt.log.ok("# External files:");
			grunt.log.ok("");

			grunt.log.ok("## Libraries:");
			matches = files(config.options.external.libs, 'lib');
			for (var i = 0; i < matches.length; i++) {
				grunt.log.ok(matches[i].src + ' -> ' + matches[i].dst);
			}

			grunt.log.ok("");
			grunt.log.ok("## CSS-files:");
			matches = files(config.options.external.css, 'css');
			for (var i = 0; i < matches.length; i++) {
				grunt.log.ok(matches[i].src + ' -> ' + matches[i].dst);
			}
		},

		libs: function() {
			grunt.log.ok("Build: libs");
			grunt.log.ok("");
		},

		index: function() {
			grunt.log.ok("Build: index");
			grunt.log.ok("");
		},

		dist: function() {
			grunt.log.ok("Build: dist");
			grunt.log.ok("");
		},

		clean: function() {
			grunt.log.ok("Build: clean");
			grunt.log.ok("");
		},

		verify: function() {
			grunt.log.ok("Build: verify");
			grunt.log.ok("");
		},
	};

	grunt.registerTask('build', 'Handle all steps for standalone application Javascript development.', function(op) {

		if (op in build) {
			return build[op]();
		}

		grunt.log.ok("");
		grunt.log.ok("Build operations are:");
		grunt.log.ok("");
		grunt.log.ok("grunt build:info - display summary of the configured files and locations.");
		grunt.log.ok("grunt build:libs - copy all required files from node-packages into the work directory.");
		grunt.log.ok("grunt build:index - scan all configured javascript and css files and update html-files using them.");
		grunt.log.ok("grunt build:verify - run all verifications required for valid build.");
		grunt.log.ok("grunt build:dist - collect and minify all application files into the dist-directory.");
		grunt.log.ok("grunt build:clean - cleanup all build artifacts.");
		grunt.log.ok("");
	});
};
