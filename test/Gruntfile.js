module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    build: {
        options: {
            name: 'cog_unittest',
            src: {
                other: []
            },
            index: {
                test: 'index.html'
            },
        }
    },
  });

  grunt.loadTasks('../tasks/');

  // Default task.
  grunt.registerTask('default', ['usage']);
};
