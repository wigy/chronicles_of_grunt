module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
      cog: {
          options: {
              name: 'cog_unittest',
              title: "CoG Unit-testing",
              external: {
                  lib: ['angular'],
                  css: ['bootstrap'],
                  unittestlib: ['jasmine'],
                  unittestcss: ['jasmine'],
              },
              docs: {
                engine: 'ngdocs'
              },
              src: {
                config: 'src/config.js',
                models: 'src/models.js',
                data: 'src/data/**/*.js',
                css: ['src/*.css'],
                templates: 'src/templates/*',
              },
              index: {
                app: 'index.html'
              },
              media: {
                  pics: ['pics/*.ascii'],
                  src: {
                      pics: {
                          files: 'ascii-art/**/*.txt',
                          dst: 'pics/{{SUBDIR}}/{{BASENAME}}.ascii',
                          convert: 'cp {{SRC}} {{DST}}'
                      }
                  }
              }
          }
      }
  });

  grunt.loadTasks('../../tasks/');
  // TODO: Test in Gruntfile.js.
  // Default task.
  grunt.registerTask('default', ['usage']);
};
