module.exports = function(grunt) {
    /*
    * This is the initial project configuration showing default values.
    * Feel free to clean it up. Only required values are name and title.
    * Probably few source code file definitions are needed as well.
    */
    grunt.initConfig({
        cog: {
            options: {
                name: 'code_name_of_project',
                title: 'Title of the Project',
                paths: {
                    libs: 'lib/',                      // A directory, where libraries are kept, when collected with `libs` task.
                    dist: 'dist/',                     // Build directory where compressed application is stored.
                    docs: 'docs/',                     // Build directory for API docs.
                    template: 'generated-template.js', // Name of the file, where pre-compiled templates are stored.
                },
                external: [],                          // A list of external libraries used like 'angular' or 'jquery'.
                index: {
                    app: 'index.html',                 // Application launhcher. Remove this if not used.
                    test: 'test.html',                 // Visual presentation of the testing. Remove this if not used.
                },
                src: {
                    config: [],                        // Configuration and other source code files that has to be included first.
                    libs: [],                          // Libraries written in this project to be included second.
                    models: [],                        // Data model source code files that are included second.
                    data: [],                          // Data files to be included after models.
                    code: [],                          // The rest of the source code files.
                    templates: [],                     // A list of HTML-file templates (usage depends on the framework).
                    css: [],                           // CSS files of the application.
                    shell: [],                         // Tools written as shell scripts.
                    task: [],                          // Grunt-task definitions and their support files.
                    otherjs: [],                       // Any other Javascript-files that are not part of the distribution.
                    other: [],                         // Any other (non-Javascript) files that are not part of the distribution.
                },
                media: {
                    pics: [],                          // All images for the application.
                    sounds: [],                        // All sounds for the application.
                    src: {
                        pics: {},                      // Rules to generate images for the application (see manual).
                        sounds: {},                    // Rules to generate sounds for the application (see manual).
                    },
                },
                docs: {
                    engine: 'jsdoc',
                },
                test: {
                    unit: {
                        external: [],                  // Testing frameworks and libs, e.g. 'jasmine'.
                        tests: [],                     // Actual tests.
                        data: [],                      // Additional data used in testing.
                    },
                },
            }
        },
    });

    // Load all CoG tasks.
    grunt.loadTasks('node_modules/chronicles_of_grunt/tasks/');

    // Default task.
    grunt.registerTask('default', ['usage']);
};
