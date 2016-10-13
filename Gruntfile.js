module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    cog: {
        options: {
            name: 'cog',
            title: 'Chronicles of Grunt',
            cog_development: true,
            index: {
                app: 'index.html'
            },
            src: {
                task: 'tasks/*.js',
                python: '*.py',
                otherjs: ['lib/*.js', 'test/runner.js'],
                other: 'templates/**'
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
