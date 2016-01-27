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
                libs: 'lib/*.js',
                otherjs: 'test/runner.js',
                other: 'templates/*.js'
            },
            docs: {
                engine: 'jsdoc'
            },
            test: {
                unit: {
                    external: ['nodeunit'],
                    tests: 'test/*_test.js',
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
