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
            src: {
                code: 'test/sample.js',
                other: ['Gruntfile.js', 'tasks/*.js']
            },
            test: {
                unit: 'test/*_spec.js'
            },
            external: {
                 unittestlib: ['jasmine'],
                 unittestcss: ['jasmine'],
            },
            index: {
                test: 'test.html'
            },
        }
    },
  });

  grunt.loadTasks('tasks/');
  grunt.loadTasks('node_modules/grunt-contrib-nodeunit/tasks/');

  // Default task.
  grunt.registerTask('default', ['usage']);
};
