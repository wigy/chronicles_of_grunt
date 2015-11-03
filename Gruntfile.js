module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    build: {
        options: {
            name: 'cog',
            cog_development: true,
            external: {
                lib: [],
                css: [],
                fonts: [],
            },
            src: {
                config: ['Gruntfile.js'],
                code: ['tasks/*.js'],
                models: [],
                data: [],
            },
        }
    },
  });

  grunt.loadTasks('tasks/');

  // Default task.
  grunt.registerTask('default', ['usage']);
};
