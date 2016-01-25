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
                // TODO: Maybe self-developed lib-files need to have own category.
                otherjs: ['test/runner.js', 'lib/*.js'],
                other: ['templates/*.js']
            },
            docs: {
                engine: 'jsdoc'
            },
            test: {
                unit: {
                    tests: 'test/*_test.js',
                    external: ['nodeunit'],
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
