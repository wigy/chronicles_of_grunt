'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    usage: {
        options: {cog_development: true}
    },
    build: {
        options: {
            work_dir: "test/",
            build_dir: "test/dist",
            external: {
                lib: [{src: 'node_modules/grunt-contrib-jshint/tasks/lib/*.js', dst: 'lib'},
                       {src: 'node_modules/grunt/lib/**/*.js', dst: 'lib/grunt-lib', drop: 'node_modules/grunt/lib'}],
                css: [{src: 'node_modules/grunt-contrib-watch/test/fixtures/**/*.css', dst: 'css'}],
                font: [],
            },
            settings: [],
            models: [],
            src: [],
        }
    },
    jshint: {
      tasks: {
        src: ['tasks/**/*.js']
      },
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.loadTasks('tasks/');

  // Default task.
  grunt.registerTask('default', ['usage']);
};
