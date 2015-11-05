module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // TODO: Move to build.js when configuration shows nodeunit.
    nodeunit: {
        all: ['test/*_test.js'],
        options: {}
    },
    build: {
        options: {
            name: 'cog',
            cog_development: true,
            work_dir: 'test/work_dir',
            src: {
                other: ['Gruntfile.js', 'tasks/*.js']
            },
            test: {
                unit: 'test/*_test.js'
            },
            external: {
                 unittestlib: ['nodeunit']
            },
            index: {
                test: 'test.html'
            },
        }
    },
  });

  grunt.loadTasks('tasks/');

  // Default task.
  grunt.registerTask('default', ['usage']);
};
