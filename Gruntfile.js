module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    build: {
        options: {
            name: 'cog',
            cog_development: true,
            src: {
                task: 'tasks/*.js',
                other: 'test/runner.js'
            },
            test: {
                unit: {
                    tests: 'test/*_test.js',
                    lib: 'nodeunit',
                    data: 'test/workdir/**'
                }
            }
        }
    },
  });

  grunt.loadTasks('tasks/');

  // Default task.
  grunt.registerTask('default', ['usage']);
};
