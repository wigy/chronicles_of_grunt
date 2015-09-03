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
                libs: [{src: 'node_modules/grunt-contrib-jshint/test/*.js'},
                       {src: 'node_modules/grunt/lib/**/*.js', dst: 'lib/grunt-lib', drop: 'node_modules/grunt/lib'}],
                css: [],
                fonts: [],
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
