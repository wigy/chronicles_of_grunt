/*
 * (C) 2015 Tommi Ronkainen
 *
 * Licenced under GPL-2.
 */

module.exports = function(grunt) {

	// Build functions.
	var build = {

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
	}

	grunt.registerTask('build', 'Handle all steps for standalone application Javascript development.', function(op) {

		if (op in build) {
			return build[op]();
		}

		grunt.log.ok("");
		grunt.log.ok("Build operations are:");
		grunt.log.ok("");
		grunt.log.ok("grunt build:libs - copy all required files from node-packages into the lib-directory.");
		grunt.log.ok("grunt build:index - scan all configured javascript and css files and update html-files using them.");
		grunt.log.ok("grunt build:verify - run all verifications required for valid build.");
		grunt.log.ok("grunt build:dist - collect and minify all application files into the dist-directory.");
		grunt.log.ok("grunt build:clean - cleanup all build artifacts.");
		grunt.log.ok("");
	});
};
