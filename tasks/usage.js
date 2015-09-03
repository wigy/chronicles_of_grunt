/*
 * (C) 2015 Tommi Ronkainen
 *
 * Licenced under GPL-2.
 */

module.exports = function(grunt) {
	grunt.registerTask('usage', 'Display grunt tasks meant for the developer.', function() {

		// Exclude internally used tasks.
		var excludes = ['default', 'usage', 'availabletasks'];

		var options = this.options();

		if (options.cog_development) {
			grunt.loadNpmTasks('grunt-available-tasks');
		} else {
			grunt.loadTasks('node_modules/chronicles_of_grunt/node_modules/grunt-available-tasks/tasks/');
		}

		grunt.initConfig({availabletasks: {tasks: {options: {filter: 'exclude', tasks: excludes}}}});
		grunt.task.run(['availabletasks']);
	});
};
