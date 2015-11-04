module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    build: {
        options: {
            name: 'cog',
            cog_development: true,
            src: {
                code: 'test/sample.js',
                other: ['Gruntfile.js', 'tasks/*.js']
            },
            test: {
                unit: 'test/*_spec.js'
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
