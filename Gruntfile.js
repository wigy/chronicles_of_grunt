module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    cog: {
        options: {
            name: 'cog',
            title: 'Chronicles of Grunt',
            cog_development: true,
            src: {
                task: 'tasks/*.js',
                other: 'test/runner.js'
            },
            docs: {
                engine: 'jsdoc'
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
