module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    build: {
        options: {
            cog_development: true,
            work_dir: "test/",
            build_dir: "test/dist",
            external: {
                lib: [{src: 'node_modules/grunt-contrib-jshint/tasks/lib/*.js', dst: 'lib'},
                       {src: 'node_modules/grunt/lib/**/*.js', dst: 'lib/grunt-lib', drop: 'node_modules/grunt/lib'}],
                css: [{src: 'node_modules/grunt-contrib-watch/test/fixtures/**/*.css', dst: 'css'}],
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
