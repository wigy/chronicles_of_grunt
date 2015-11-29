/*
 * Chronicles of Grunt
 * (C) 2015 Tommi Ronkainen
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
module.exports = function(grunt) {

    // Get the package configuration.
    var pckg = grunt.file.readJSON('package.json');

    // Load Node-modules.
    var path = require('path');
    var colors = require('colors');
    var fs = require('fs');
    var ff = require('./file-filter.js')(grunt);
    var log = require('./log.js')(grunt);
    var readme = require('./readme.js')(grunt);

    // Load tasks needed.
    var modules = ff.prefix();

    if (ff.getConfig('cog_development')) {
        grunt.loadNpmTasks('grunt-shell');
    }

    grunt.loadTasks(modules + 'grunt-contrib-jshint/tasks/');
    grunt.loadTasks(modules + 'grunt-contrib-cssmin/tasks/');
    grunt.loadTasks(modules + 'grunt-contrib-uglify/tasks/');
    grunt.loadTasks(modules + 'grunt-contrib-concat/tasks/');
    grunt.loadTasks(modules + 'grunt-available-tasks/tasks/');
    grunt.loadTasks(modules + 'grunt-contrib-jasmine/tasks/');
    grunt.loadTasks(modules + 'grunt-contrib-csslint/tasks/');
    grunt.loadTasks(modules + 'grunt-contrib-nodeunit/tasks/');
    grunt.loadTasks(modules + 'grunt-jsdoc/tasks/');
    grunt.loadTasks(modules + 'grunt-contrib-clean/tasks/');
    grunt.loadTasks(modules + 'grunt-contrib-watch/tasks/');

    /**
     * Refresh HTML-file to use the given Javascript and CSS files.
     *
     * @param dst {string} Target path to the HTML-file.
     * @param jsFiles {Array} New list of Javascript-files to include.
     * @param cssFiles {Array} New list of CSS-files to include.
     */
    function writeIndex(dst, jsFiles, cssFiles) {

        var i;

        // Construct javascript includes.
        var js = "";
        for (i=0; i < jsFiles.length; i++) {
            js += '    <script src="' + jsFiles[i] + '"></script>\n';
        }

        // Construct CSS includes.
        var css = "";
        for (i=0; i < cssFiles.length; i++) {
            css += '    <link rel="stylesheet" href="' + cssFiles[i] + '">\n';
        }

        // Insert inclusions to the index filr.
        var content = "";
        var file = grunt.file.read(dst).trim();
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
                content += "  </head>\n";
                continue;
            } else {
                content += lines[j] + "\n";
            }
        }
        if (!added) {
            grunt.fail.fatal("Cannot find </head> from index file: " + dst);
        }
        grunt.file.write(dst, content);
    }

    function taskInfo() {

        /**
         * List files returned by the given listing function on screen.
         */
        function dumpFiles(title, fn) {
            var matches = fn();
            if (matches.length) {
                log.info("");
                log.info((title + ":")['green']);
                for (var i = 0; i < matches.length; i++) {
                    if (matches[i].src === matches[i].dst) {
                        log.info(matches[i].dst);
                    } else {
                        log.info(matches[i].dst + ' (from ' + matches[i].src + ')');
                    }
                }
            }
        }

        log.info("Build: info");
        log.info("");
        log.info("Project: " + ff.getConfig('name'));
        log.info("Version: " + pckg.version);
        dumpFiles('External Libraries', ff.extLibFiles);
        dumpFiles('External Library map files', ff.extLibMapFiles);
        dumpFiles('External CSS-files', ff.extCssFiles);
        dumpFiles('External Fonts', ff.extFontFiles);
        dumpFiles('Index files', ff.indexFiles);
        dumpFiles('Configuration and global utilities', ff.configFiles);
        dumpFiles('Model files', ff.modelFiles);
        dumpFiles('Data files', ff.dataFiles);
        dumpFiles('Code files', ff.codeFiles);
        dumpFiles('CSS-files', ff.cssFiles);
        dumpFiles('Other Javascript-files', ff.otherFiles);
        dumpFiles('Unit test libraries', ff.unitTestLibraryFiles);
        dumpFiles('Unit test CSS-files', ff.includeUnitTestCssFiles);
        dumpFiles('Unit tests', ff.unitTestFiles);
    }

    function taskLibs() {
        log.info("Build: libs");
        log.info("");
        var matches = ff.extFiles();
        for (var i = 0; i < matches.length; i++) {
            log.info(matches[i].src + ' -> ' + matches[i].dst);
            grunt.file.copy(matches[i].src, matches[i].dst);
        }
    }

    function taskIndex() {

        var i, indices, jsFiles, cssFiles;

        log.info("Build: index");
        log.info("");

        indices = ff.flatten(ff.appIndexFiles());
        if (indices.length) {
            log.info("Application:");
            jsFiles = ff.flatten(ff.includeJsFiles());
            log.info('- Found ' + jsFiles.length + " Javascript-files.");
            cssFiles = ff.flatten(ff.includeCssFiles());
            log.info('- Found ' + cssFiles.length + " CSS-files.");

            for (i=0; i < indices.length; i++) {
                log.info('Updating ' + indices[i]);
                writeIndex(indices[i], jsFiles, cssFiles);
            }
        }

        indices = ff.flatten(ff.testIndexFiles());
        if (indices.length) {
            log.info("Unit Test:");
            jsFiles = ff.flatten(ff.includeUnitTestJsFiles());
            log.info('- Found ' + jsFiles.length + " Javascript-files.");
            cssFiles = ff.flatten(ff.includeUnitTestCssFiles());
            log.info('- Found ' + cssFiles.length + " CSS-files.");

            for (i=0; i < indices.length; i++) {
                log.info('Updating ' + indices[i]);
                writeIndex(indices[i], jsFiles, cssFiles);
            }
        }
    }

    function taskDist() {

        var i, dst, settings;

        log.info("Build: dist");
        log.info("");

        var matches = ff.distFilesUncompressed();
        if (matches.length) {
            log.info("");
            log.info("Copying media files...");
            log.info("");
            for (i = 0; i < matches.length; i++) {
                dst = path.join('dist', matches[i].dst);
                log.info(matches[i].dst + ' -> ' + dst);
                grunt.file.copy(matches[i].dst, dst);
            }
        }

        // Copy libraries.
        var compressedJsFiles = [];
        var libs = ff.extLibFiles();
        if (libs.length) {
            log.info("");
            log.info("Copying libraries...");
            log.info("");
            for (i = 0; i < libs.length; i++) {
                dst = 'dist/' + libs[i].dst;
                log.info(libs[i].dst + ' -> ' + dst);
                grunt.file.copy(libs[i].dst, dst);
                compressedJsFiles.push(libs[i].dst);
            }
        }

        // Collect CSS.
        var cssFiles = ff.includeCssFiles();
        var compressedCssFiles = [];
        if (cssFiles.length) {
            log.info("");
            log.info("Compressing CSS...");
            log.info("");
            settings = {all: {files: {}}};
            compressedCssFiles.push('dist/' + ff.getConfig('name') + '.min.css');
            settings.all.files[compressedCssFiles[0]] = ff.flatten(cssFiles);
            grunt.config.set('cssmin', settings);
            grunt.task.run('cssmin');
        }

        // Compress code.
        var jsFiles = ff.srcFiles();
        if (jsFiles.length) {
            log.info("");
            log.info("Collecting Javascript...");
            log.info("");
            settings = {all: {}};
            settings.all.src = ff.flatten(jsFiles);
            settings.all.dest = 'dist/' + ff.getConfig('name') + '.js';
            grunt.config.set('concat', settings);
            grunt.task.run('concat');

            log.info("");
            log.info("Compressing Javascript...");
            log.info("");
            var banner = '';
            banner += '/* ' + pckg.name + ' v' + pckg.version + '\n';
            banner += ' * Copyright (c) ' + grunt.template.today("yyyy") + (pckg.author ? ' ' + pckg.author.name : '') + '\n';
            banner += ' */\n';

            settings = {options: {banner: banner}, dist: {}};
            compressedJsFiles.push(ff.getConfig('name') + '.min.js');
            settings.dist.src = 'dist/' + ff.getConfig('name') + '.js';
            settings.dist.dest = 'dist/' + ff.getConfig('name') + '.min.js';
            grunt.config.set('uglify', settings);
            grunt.task.run('uglify');
            grunt.task.run('cleanup');
        }

        // Build index file(s).
        var indices = ff.flatten(ff.appIndexFiles());
        if (indices.length) {
            log.info("");
            log.info("Building index...");
            log.info("");
            for (i = 0; i < indices.length; i++) {
                dst = 'dist/' + indices[i];
                log.info(indices[i] + ' -> ' + dst);
                grunt.file.copy(indices[i], dst);
                writeIndex(dst, compressedJsFiles, compressedCssFiles);
            }
        }
    }

    function taskVerify(what) {

        var settings;

        log.info("Build: verify");
        log.info("");
        if (!what || what === "js") {
            settings = {
                all: ff.flatten(ff.allSrcFiles()),
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
        }
        if (!what || what === "css") {
            settings = {
                src: ff.flatten(ff.cssFiles()),
                options: {
                    "fallback-colors": false
                },
            };
            grunt.config.set('csslint', settings);
            grunt.task.run('csslint');
        }
    }

    function taskVersion(version) {
        if (arguments.length === 0) {
            log.info("");
            log.info("Current version is", pckg.version);
            log.info("");
            log.info("You can make official release by giving new version number like 'x.y.z' or");
            log.info("you can start next release candidate by add postfix 'x.y.z-beta'.");
            log.info("To set new version, you run command: 'grunt version:x.y.z'");
        } else {
            if (!version.match(/^\d+\.\d+\.\d+(-beta)?$/)) {
                grunt.fail.fatal("Invalid version '" + version + "'.");
            }
            // Update package.
            var debugMode = (version.substr(version.length-4) === 'beta');
            pckg.version = version;
            grunt.file.write('package.json', JSON.stringify(pckg, null, 2));
            log.info("Set version", pckg.version, "to package.json.");

            // Update other files.
            var files = ff.flatten(ff.configFiles());
            for (var i=0; i<files.length; i++) {
                var file = files[i];
                var newSettings, settings = grunt.file.read(file);
                newSettings = settings.replace(/^VERSION\s*=\s*'.*'/gm, "VERSION = '" + pckg.version + "'");
                if (newSettings !== settings) {
                    log.info("Updated version", pckg.version, "to", file);
                    settings = newSettings;
                }
                newSettings = settings.replace(/^DEBUG\s*=\s[^;]*/gm, "DEBUG = " + debugMode.toString());
                if (newSettings !== settings) {
                    log.info("Set the debug mode to", debugMode, "in", file);
                }
                grunt.file.write(file, newSettings);
            }
        }
    }

    function taskTodo(die) {

        var count = 0;
        var files = ff.flatten(ff.workTextFiles());
        var TODO = "TODO" + ":";
        for (var i=0; i<files.length; i++) {
            var seen = false;
            var lines = grunt.file.read(files[i]).split("\n");
            for (var j=0; j<lines.length; j++) {
                if( lines[j].indexOf(TODO) >= 0) {
                    count++;
                    if (!seen) {
                        seen = true;
                        log.info("");
                        log.info(("   " + files[i])["blue"]);
                        log.info("");
                    }
                    log.info(("Line " + (j+1) + "")["green"], lines[j].trim());
                }
            }
        }

        log.info("");
        log.info(("TODO-entries open: " + count)["magenta"]);
        log.info("");
        if (count && die === 'die') {
            grunt.fail.fatal("There are unfinished TODO-entries that needs to be resolved.\n" +
                                "Please cancel or implement them or gather them to the version plan.");
        }
    }

    function taskTest(which) {

        /**
          * Check the selected libraries for testing system.
          */
        function configuredUnitTesting() {
            var lib = ff.getConfig('external.unittestlib');
            if (lib.indexOf('jasmine') >= 0) {
                return 'jasmine';
            }
            if (lib.indexOf('nodeunit') >= 0) {
                return 'nodeunit';
            }
            return null;
        }

        var settings;

        // Select test runner.
        var type = configuredUnitTesting();
        if (!type) {
            grunt.fail.fatal("Testing system is not configured. Please set external.unittestlib to the 'jasmine' or 'nodeunit'.");
        }

        // Collect files for test.
        var src = ff.flatten(ff.srcFiles());
        var specs = ff.flatten(ff.unitTestFiles());
        var libs = ff.flatten(ff.extLibFiles());

        // Add all other than Jasmine-libs to vendor list.
        libs = libs.concat(ff.flatten(ff.removeDuplicates(ff.unitTestLibraryFiles(), ff.files(['jasmine'], 'lib'))));

        // Select defined tests.
        var args = Array.prototype.slice.call(arguments);
        if (args.length) {
            var selected = [];
            for (var i = 0; i < args.length; i++) {
                for (var j = 0; j < specs.length; j++) {
                    if (specs[j].indexOf(args[i]) >= 0) {
                        selected.push(specs[j]);
                    }
                }
            }

            if (!selected.length) {
                grunt.fail.fatal("No tests match to the given arguments.");
            }
            specs = selected;
        }

        // Run Jasmine.
        if (type === 'jasmine') {
            settings = {
                all: {
                    src: src,
                    options: {
                        specs: specs,
                        vendor: libs
                    },
                }
            };
            grunt.config.set('jasmine', settings);
            grunt.task.run('jasmine');
        }

        // Run nodeunit.
        else if (type === 'nodeunit') {
            settings = {
                all: specs,
                options: {}
            };
            grunt.config.set('nodeunit', settings);
            grunt.task.run('nodeunit');
        }
    }

    function taskPreRelease() {
        // Check that we are in development mode.
        if (/^[.0-9]+$/.test(pckg.version)) {
            grunt.fail.fatal("Cannot make release from this version.\nMust have a non-release version like 1.1.0-beta as the current version.");
        }
        // Check that all has been done.
        var parsed = readme.parse();
        if (parsed.next_version.not_yet_done.length > 0) {
            grunt.fail.fatal("There are things 'Not Yet Done' section of 'Next Version':\n * " + parsed.next_version.not_yet_done.join("\n * "));
        }
        // Check that somthing has been done.
        if (parsed.next_version.done.length === 0) {
            grunt.fail.fatal("There are not any entries in 'Done' section of 'Next Version'.");
        }

        log.info("Looking good.");
        log.info("Running standard release checks next.");
    }

    function taskRelease(skipped) {
        var args = Array.prototype.slice.call(arguments);
        var tasks = ['prerelease'];
        if (args.indexOf('verify') < 0) {
            tasks.push('verify');
        }
        if (args.indexOf('todo') < 0) {
            tasks.push('todo:die');
        }
        if (args.indexOf('test') < 0) {
            tasks.push('test');
        }
        if (args.indexOf('dist') < 0) {
            tasks.push('dist');
        }
        if (args.indexOf('docs') < 0) {
            tasks.push('docs');
        }
        tasks.push('postrelease');
        grunt.task.run(tasks);
    }

    function taskPostRelease() {
        // Calculate new version and print out summary.
        var parsed = readme.parse();
        var version = pckg.version.replace(/[^0-9.]+$/, '');
        log.info("All checks passed!");
        log.info("Ready for the release:");
        log.info("");
        log.info("  Version: " + version["cyan"]);
        log.info("  Changes:");
        for (var i=0; i < parsed.next_version.done.length; i++) {
            log.info("  * " + parsed.next_version.done[i]["cyan"]);
        }
        log.info("");
        log.info("Once commited and tagged, you can start next iteration by assigning new development version");
        log.info("and making plans by collecting goals for the next version into README.md.");
        log.info("");
        // Re-calculate versioning data and write it back.
        parsed.release(version);
        parsed.write();
        grunt.task.run('version:' + version);
    }

    function taskDocs(what) {

        var settings = {
            dist: {
                src: ff.flatten(ff.allSrcFiles()),
                options: {
                    destination: 'doc',
                }
            }
        };

        grunt.config.set('jsdoc', settings);
        grunt.task.run('jsdoc');
    }

    function taskCleanup() {

        var settings = {
            all: ['dist/' + ff.getConfig('name') + '.js']
        };

        grunt.config.set('clean', settings);
        grunt.task.run('clean');
    }

    function taskAuto(what) {

        if (!what) {
            what = 'docs';
        }

        var options = {spwan: false, interrupt: true};

        var settings = {
            docs: {
                files: ff.flatten(ff.allSrcFiles()),
                tasks: ['docs'],
                options: options
            },
            test: {
                files: ff.flatten(ff.srcFiles().concat(ff.unitTestFiles())),
                tasks: ['test'],
                options: options
            },
            css: {
                files: ff.flatten(ff.cssFiles()),
                tasks: ['verify:css'],
                options: options
            },
            js: {
                files: ff.flatten(ff.allSrcFiles()),
                tasks: ['verify:js'],
                options: options
            }
        };

        if (!(what in settings)) {
            grunt.fail.fatal("Invalid argument for auto-task. Only supported are " + Object.keys(settings) + ".");
        }
        grunt.config.set('watch', settings);
        grunt.task.run('watch:' + what);
    }

    grunt.registerTask('info', 'Display summary of the configured files and locations.', taskInfo);
    grunt.registerTask('libs', 'Update fresh copies of libraries from installed node-modules.', taskLibs);
    grunt.registerTask('index', 'Scan all configured javascript and css files and update html-files using them.', taskIndex);
    grunt.registerTask('verify', 'Run all verifications required for valid build.', taskVerify);
    grunt.registerTask('dist', 'Collect and minify all application files into the dist-directory.', taskDist);
    grunt.registerTask('version', 'Query and mark the version to the source files.', taskVersion);
    grunt.registerTask('todo', 'Scan for TODO-entries from the source code and display them.', taskTodo);
    grunt.registerTask('test', 'Run all tests.', taskTest);
    grunt.registerTask('prerelease', 'Pre checks for the relase.', taskPreRelease);
    grunt.registerTask('postrelease', 'File updating tasks relase.', taskPostRelease);
    grunt.registerTask('release', 'Make all sanity checks and if passed, create next release version.', taskRelease);
    grunt.registerTask('docs', 'Build all documentation.', taskDocs);
    grunt.registerTask('cleanup', 'Remove unnecessary files.', taskCleanup);
    grunt.registerTask('auto', 'Automatically run tasks when files have changed.', taskAuto);

    grunt.registerTask('usage', 'Display summary of available tasks.', function() {
        var excludes = ['default', 'usage', 'availabletasks', 'jshint', 'uglify', 'cssmin', 'concat', 'jasmine',
                        'csslint', 'nodeunit', 'shell', 'prerelease', 'postrelease', 'jsdoc', 'clean', 'cleanup',
                        'watch'];
        grunt.initConfig({availabletasks: {tasks: {options: {filter: 'exclude', tasks: excludes}}}});
        grunt.task.run(['availabletasks']);
    });
};
