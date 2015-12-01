module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    build: {
        options: {
            name: 'cog',
            cog_development: true,
            src: {
                other: ['tasks/*.js', 'test/runner.js']
            },
            test: {
                unit: 'test/*_test.js'
            },
            external: {
                 unittestlib: ['nodeunit']
            },
            ignore: ['test/workdir/**']
        }
    },
  });

  grunt.loadTasks('tasks/');

  // Default task.
  grunt.registerTask('default', ['usage']);
};
