/*
 * (C) 2015 Tommi Ronkainen
 *
 * Licenced under GPL-2.
 */

module.exports = function(grunt) {
	grunt.registerTask('usage', 'Display grunt tasks meant for the developer.', function() {

		// Exclude internally used tasks.
		var excludes = ['default', 'usage', 'availabletasks'];

		grunt.loadNpmTasks('grunt-available-tasks');
		grunt.initConfig({availabletasks: {tasks: {options: {filter: 'exclude', tasks: excludes}}}});
		grunt.task.run(['availabletasks']);
	});
};
