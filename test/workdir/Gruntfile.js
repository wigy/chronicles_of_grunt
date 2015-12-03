module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    cog: {
        options: {
            name: 'cog_unittest',
            external: {
                lib: ['angular'],
                css: ['bootstrap'],
                unittestlib: ['jasmine'],
                unittestcss: ['jasmine'],
            },
            src: {
              config: 'src/config.js',
              models: 'src/models.js',
              data: 'src/data/**/*.js',
              css: ['src/*.css'],
            },
            index: {
              app: 'index.html'
            },
        }
    },
  });

  grunt.loadTasks('../../tasks/');
  // TODO: Test in Gruntfile.js.
  // Default task.
  grunt.registerTask('default', ['usage']);
};
