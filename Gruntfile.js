'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    usage: {options: {cog_development: true}},
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
