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
                options: {
                    libs: 'lib/',                      // A directory, where libraries are kept, when collected with `libs` task.
                    dist: 'dist/',                     // Build directory where compressed application is stored.
                    docs: 'docs/',                     // Build directory for API docs.
                    template: null,                    // Full path to the file, where pre-compiled templates are stored.
                    include_drop: '',                  // Drop this string from the beginning of the include path when making application index.
                    include_prefix: '',                // Add this string in the beginning of the include path when making application index.
                    include_only_external: false,      // If set to true, only external libraries are added to the application index.
                    test_include_only_external: false, // If set to true, only external libraries are added to the unit test index.
                    api_data: null,                    // If set along with 'api_url_prefix', use this directory to serve JSON API-data.
                    api_url_regex: null,               // If set along with 'api_data', then urls matching this regex are served as JSON API-data.
                    todo_in_readme: null,              // If set, maintain TODO entries in README.md like in this project (autodetect by default).
                    ignore_dirs: ['node_modules', 'bower_components'], // Ignore these directories.
                    python_line_length: 120,           // Maximum line length for PEP8 Python verification.
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
                    task: [],                          // Grunt-task definitions and their support files.
                    otherjs: [],                       // Any other Javascript-files that are not part of the distribution.
                    other: [],                         // Any other (non-Javascript) files that are not part of the distribution.
                    shell: [],                         // Tools written as shell scripts.
                    python: [],                        // Python source code.
                },
                compiled: {
                    python: '**/*.pyc'                 // Files that are compilation results that are essentially ignored.
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
                        external: [],                  // Testing frameworks and libs, e.g. 'jasmine' or 'nodeunit'.
                        tests: [],                     // Actual tests.
                        helpers: [],                   // Javascript helpers for unit testing.
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
