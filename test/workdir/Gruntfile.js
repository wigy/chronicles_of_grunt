module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    build: {
        options: {
            name: 'cog_unittest',
            src: {
            },
            index: {
            },
        }
    },
  });

  grunt.loadTasks('../../tasks/');

  // Default task.
  grunt.registerTask('default', ['usage']);
};
