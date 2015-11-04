module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // TODO: Remove Jasmine config once working via CoG.
    jasmine: {
        all: {
            // TODO: How to ignore files that are not loadable in test? Add some flag?
            src: [],
            options: {
                specs: 'test/*_spec.js'
            }
        }
    },
    build: {
        options: {
            name: 'cog',
            cog_development: true,
            src: {
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
