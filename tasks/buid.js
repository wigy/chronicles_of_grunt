/*
 * (C) 2015 Tommi Ronkainen
 *
 * Licenced under GPL-2.
 */

module.exports = function(grunt) {

    // Get the build configuration and set some variables.
    var config = grunt.config.get('build') || {options: {}};
    var work_dir = config.options.work_dir || '.';

    // Load tasks.
    if (config.options.cog_development) {
		grunt.loadNpmTasks('grunt-contrib-jshint');
		grunt.loadNpmTasks('grunt-contrib-cssmin');
		grunt.loadNpmTasks('grunt-contrib-uglify');
    } else {
		grunt.loadTasks('node_modules/chronicles_of_grunt/node_modules/grunt-contrib-jshint/tasks/');
		grunt.loadTasks('node_modules/chronicles_of_grunt/node_modules/grunt-contrib-cssmin/tasks/');
		grunt.loadTasks('node_modules/chronicles_of_grunt/node_modules/grunt-contrib-uglify/tasks/');
    }

    // Load Node-modules.
    var path = require('path');

    // Known library copy specifications.
    var known = {
        lib: {
            coa: {src: 'node_modules/chronicles_of_angular/lib/**', dst: 'lib/chronicles_of_angular', drop: 'node_modules/chronicles_of_angular/lib'},
            jquery: {src: 'node_modules/jquery/dist/jquery.min.*', dst: 'lib', drop: 'node_modules/jquery/dist'},
            bootstrap: {src: 'node_modules/bootstrap/dist/js/bootstrap.min.js', dst: 'lib', drop: 'node_modules/bootstrap/dist/js'},
            angular: {src: 'node_modules/angular/angular.min.{js,js.map}', dst: 'lib', drop: 'node_modules/angular/'},
        },
        css: {
            bootstrap: {src: 'node_modules/bootstrap/dist/css/bootstrap.min.css', dst: 'css', drop: 'node_modules/bootstrap/dist/css/'},
        },
        fonts: {
            bootstrap: {src: 'node_modules/bootstrap/dist/fonts/*', dst: 'fonts', drop: 'node_modules/bootstrap/dist/fonts/'},
        },
    };

    // Helper functions for file handling.

    /**
     * Collect list of source file patterns and expand them to single files.
     */
    function files(specs, category) {
        var ret = [];
        var src, dst, file;
        var i, j;

        if (specs) {
            if (typeof(specs) === 'string') {
                if (/[^a-zA-Z]/.test(specs)) {
                    src = grunt.file.expand(specs);
                    for (i=0; i < src.length; i++) {
                        ret.push({src: src[i], dst: src[i], drop: ''});
                    }
                } else if (known[category] && specs in known[category]) {
                    ret = ret.concat(files(known[category][specs], category));
                } else {
                    grunt.fail.fatal("Unknown build file specification '" + specs +"' for '" + category + "'.");
                }
            } else if (specs instanceof Array) {
                for (i = 0; i < specs.length; i++) {
                    ret = ret.concat(files(specs[i], category));
                }
            } else if (typeof(specs) === 'object') {
                // Here we expand pattens from 'src' and combine them with 'dst'.
                src = grunt.file.expand(specs.src);
                for (j=0; j < src.length; j++) {
                    var drop = specs.drop;
                    if (!drop) {
                        drop = specs.src;
                        while (drop.indexOf('*') >= 0) {
                            drop = path.dirname(drop);
                        }
                    }
                    file = {};
                    file.src = src[j];
                    if (grunt.file.isDir(file.src)) {
                        continue;
                    }
                    dst = src[j];
                    if (dst.substr(0, drop.length) === drop) {
                        dst = src[j].substr(drop.length);
                    }
                    file.dst = path.join(work_dir, specs.dst || category, dst);
                    ret.push(file);
                }
            }
        }
        return ret;
    }

    /**
     * Scan file specs and remove duplicates.
     *
     * @param files {Array} List of resolved file specs.
     * @param duplicates {Array} Optional list of resolved file specs to consider duplicates.
     */
    function removeDuplicates(files, duplicates) {
        var i;
        var ret = [];
        var found = {};

        if (duplicates) {
            for (i=0; i < duplicates.length; i++) {
                found[duplicates[i].dst] = true;
            }
        }

        for (i=0; i < files.length; i++) {
            if (!found[files[i].dst]) {
                found[files[i].dst] = true;
                ret.push(files[i]);
            }
        }
        return ret;
    }

    /**
     * Find all external library code files.
     */
    function extLibFiles() {
        return files(config.options.external.lib, 'lib');
    }

    /**
     * Find all exyternal CSS files.
     */
     function extCssFiles() {
         return files(config.options.external.css, 'css');
     }

    /**
     * Find all external font files.
     */
    function extFontFiles() {
        return files(config.options.external.fonts, 'fonts');
    }

    /**
     * Find all external files.
     */
    function extFiles() {
        return removeDuplicates(extLibFiles().concat(extCssFiles()).concat(extFontFiles()));
    }

    /**
     * Find application index files.
     */
    function appIndexFiles() {
        return files(config.options.index.app, 'index');
    }

    /**
     * Find test index files.
     */
    function testIndexFiles() {
        return files(config.options.index.test, 'index');
    }

    /**
     * Find test index files.
     */
    function indexFiles() {
        return appIndexFiles().concat(testIndexFiles());
    }

    /**
     * Find all configuration files.
     */
    function configFiles() {
        return files(config.options.src.config, 'config');
    }

    /**
     * Find all models.
     */
    function modelFiles() {
        return removeDuplicates(files(config.options.src.models, 'models'), configFiles());
    }

    /**
     * Find all data files (not models).
     */
    function dataFiles() {
        return removeDuplicates(files(config.options.src.data, 'data'), configFiles().concat(modelFiles()));
    }

    /**
     * Find all source code files (not data nor models).
     */
    function codeFiles() {
        return removeDuplicates(files(config.options.src.code, 'code'), configFiles().concat(modelFiles()).concat(dataFiles()));
    }

    /**
     * Find all source code files.
     */
    function srcFiles() {
        return removeDuplicates(configFiles().concat(modelFiles()).concat(dataFiles()).concat(codeFiles()));
    }

    /**
     * Find all CSS files.
     */
    function cssFiles() {
        return removeDuplicates(files(config.options.src.css, 'css'), extCssFiles());
    }

	/**
     * Find all graphics files.
     */
    function picFiles() {
        return files(config.options.src.pics, 'pics');
    }

	/**
     * Find all audio files.
     */
    function soundFiles() {
        return files(config.options.src.sounds, 'sounds');
    }

    /**
     * Find all code files needed to include in HTML index.
     */
    function includeJsFiles() {
        return extLibFiles().concat(srcFiles());
    }

    /**
     * Find all CSS files needed to include in HTML index.
     */
    function includeCssFiles() {
        return extCssFiles().concat(cssFiles());
    }

    /**
     * List of files that goes to the actual distribution unmodified.
     */
    function distFilesUncompressed() {
        return extFontFiles().concat(picFiles()).concat(soundFiles());
}

    /**
     * List files returned by the given listing function on screen.
     */
    function dumpFiles(title, fn) {
        var matches = fn();
        if (matches.length) {
            grunt.log.ok("");
            grunt.log.ok("## " + title + ":");
            for (var i = 0; i < matches.length; i++) {
                if (matches[i].src === matches[i].dst) {
                    grunt.log.ok(matches[i].dst);
                } else {
                    grunt.log.ok(matches[i].dst + ' (from ' + matches[i].dst + ')');
                }
            }
        }
    }

    /**
     * Collect destination files from file spec list.
     */
    function flatten(files) {
        var ret = [];
        for (var i=0; i < files.length; i++) {
            ret.push(files[i].dst);
        }
        return ret;
    }

    // Build functions.
    var build = {

        info: function() {

            grunt.log.ok("Build: info");
            dumpFiles('External Libraries', extLibFiles);
            dumpFiles('External CSS-files', extCssFiles);
            dumpFiles('External Fonts', extFontFiles);
            dumpFiles('Index files', indexFiles);
            dumpFiles('Configuration and utilities', configFiles);
            dumpFiles('Model files', modelFiles);
            dumpFiles('Data files', dataFiles);
            dumpFiles('Code files', codeFiles);
            dumpFiles('CSS-files', cssFiles);
        },

        libs: function() {
            grunt.log.ok("Build: libs");
            grunt.log.ok("");
            var matches = extFiles();
            for (var i = 0; i < matches.length; i++) {
                grunt.log.ok(matches[i].src + ' -> ' + matches[i].dst);
                grunt.file.copy(matches[i].src, matches[i].dst);
            }
        },

        index: function() {
            var i,j;

            grunt.log.ok("Build: index");
            grunt.log.ok("");

            // Construct javascript includes.
            var js = "";
            var jsFiles = flatten(includeJsFiles());
            for (i=0; i < jsFiles.length; i++) {
                if (/\.map$/.test(jsFiles[i])) {
                    // TODO: This should be part of file spec.
                    continue;
                }
                js += '    <script src="' + jsFiles[i] + '"></script>\n';
            }

            // Construct CSS includes.
            var css = "";
            var cssFiles = flatten(includeCssFiles());
            for (i=0; i < cssFiles.length; i++) {
                css += '    <link rel="stylesheet" href="' + cssFiles[i] + '">\n';
            }

            // Insert files to all index files.
            var indices = flatten(indexFiles());
            for (i=0; i < indices.length; i++) {
                grunt.log.ok('Updating ' + indices[i]);
                var content = "";
                var file = grunt.file.read(indices[i]).trim();
                var lines = file.split("\n");
                var added = false;
                for (j=0; j < lines.length; j++) {
                    if (/^\s*<script src=".*"><\/script>$/.test(lines[j])) {
                        // Drop javascript source file.
                        continue;
                    } else if (/^\s*<link rel="stylesheet" href=".*">$/.test(lines[j])) {
                        // Drop CSS file.
                        continue;
                    } else if (/^\s*<\/head>\s*$/.test(lines[j])) {
                        // Add the latest file lists.
                        added = true;
                        content += js;
                        content += css;
                        grunt.log.ok('- Found ' + jsFiles.length + " Javascript-files.");
                        grunt.log.ok('- Found ' + cssFiles.length + " CSS-files.");
                        content += "  </head>\n";
                        continue;
                    } else {
                        content += lines[j] + "\n";
                    }
                }
                if (!added) {
                    grunt.fail.fatal("Cannot find </head> from index file: " + indices[i]);
                }
                grunt.file.write(indices[i], content);
            }
        },

        dist: function() {
            grunt.log.ok("Build: dist");
            grunt.log.ok("");
/*
			grunt.log.ok("Copying media files...");
			grunt.log.ok("");
            var matches = distFilesUncompressed();
            for (var i = 0; i < matches.length; i++) {
                var dst = path.join('dist', matches[i].dst);
                grunt.log.ok(matches[i].dst + ' -> ' + dst);
                grunt.file.copy(matches[i].dst, dst);
            }
*/

			grunt.log.ok("Compiling CSS...");
			grunt.log.ok("");
			var settings = {all: {files: {}}};
			settings.all.files['dist/' + config.options.name + '.min.css'] = flatten(includeCssFiles());
			grunt.config.set('cssmin', settings);
			grunt.task.run('cssmin');
        },

        clean: function() {
            grunt.log.ok("Build: clean");
            grunt.log.ok("");
        },

        verify: function() {
            grunt.log.ok("Build: verify");
            grunt.log.ok("");
            var settings = {
                all: flatten(srcFiles()),
                options: {
                    curly: true,
                    eqeqeq: true,
                    immed: true,
                    latedef: true,
                    newcap: true,
                    noarg: true,
                    sub: true,
                    undef: false,
                    unused: false,
                    boss: true,
                    eqnull: true,
                    browser: true,
                    globals: {
                        jQuery: true
                    }
                },
            };
            grunt.config.set('jshint', settings);
            grunt.task.run('jshint');
        },
    };

    grunt.registerTask('build', 'Handle all steps for standalone application Javascript development.', function(op) {

        if (op in build) {
            return build[op]();
        }

        grunt.log.ok("");
        grunt.log.ok("Build operations are:");
        grunt.log.ok("");
        grunt.log.ok("grunt build:info - display summary of the configured files and locations.");
        grunt.log.ok("grunt build:libs - copy all required files from node-packages into the work directory.");
        grunt.log.ok("grunt build:index - scan all configured javascript and css files and update html-files using them.");
        grunt.log.ok("grunt build:verify - run all verifications required for valid build.");
        grunt.log.ok("grunt build:dist - collect and minify all application files into the dist-directory.");
        grunt.log.ok("grunt build:clean - cleanup all build artifacts.");
        grunt.log.ok("");
    });
};
