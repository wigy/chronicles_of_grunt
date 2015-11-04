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

    // Get the build configuration and set some variables.
    var package = grunt.file.readJSON('package.json');

    // Load Node-modules.
    var path = require('path');
    var ff = require('./file-filter.js')(grunt);
    var colors = require('colors');

    // Load tasks needed.
    if (ff.getConfig('cog_development')) {
        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-contrib-cssmin');
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-available-tasks');
        grunt.loadNpmTasks('grunt-contrib-jasmine');
    } else {
        grunt.loadTasks('node_modules/chronicles_of_grunt/node_modules/grunt-contrib-jshint/tasks/');
        grunt.loadTasks('node_modules/chronicles_of_grunt/node_modules/grunt-contrib-cssmin/tasks/');
        grunt.loadTasks('node_modules/chronicles_of_grunt/node_modules/grunt-contrib-uglify/tasks/');
        grunt.loadTasks('node_modules/chronicles_of_grunt/node_modules/grunt-contrib-concat/tasks/');
        grunt.loadTasks('node_modules/chronicles_of_grunt/node_modules/grunt-available-tasks/tasks/');
        grunt.loadTasks('node_modules/chronicles_of_grunt/node_modules/grunt-contrib-jasmine/tasks/');
    }

    /**
     * Refresh HTML-file to use the given Javascript and CSS files.
     *
     * @param dst {string} Target path to the HTML-file.
     * @param jsFiles {Array} New list of Javascript-files to include.
     * @param cssFiles {Array} New list of CSS-files to include.
     */
    function buildIndex(dst, jsFiles, cssFiles) {

        var i;

        // Construct javascript includes.
        var js = "";
        for (i=0; i < jsFiles.length; i++) {
            if (/\.map$/.test(jsFiles[i])) {
                // TODO: This should be part of file spec.
                continue;
            }
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

    // Build functions.
    var build = {

        info: function() {

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

			grunt.log.ok("Project: " + ff.getConfig('name'));
			grunt.log.ok("Work dir: " + ff.getConfig('work_dir', '.'));
            dumpFiles('External Libraries', ff.extLibFiles);
            dumpFiles('External CSS-files', ff.extCssFiles);
            dumpFiles('External Fonts', ff.extFontFiles);
            dumpFiles('Index files', ff.indexFiles);
            dumpFiles('Configuration and global utilities', ff.configFiles);
            dumpFiles('Model files', ff.modelFiles);
            dumpFiles('Data files', ff.dataFiles);
            dumpFiles('Code files', ff.codeFiles);
            dumpFiles('CSS-files', ff.cssFiles);
            dumpFiles('Other Javascript-files', ff.otherFiles);
            dumpFiles('Unit tests', ff.unitTestFiles);
        },

        libs: function() {
            grunt.log.ok("Build: libs");
            grunt.log.ok("");
            var matches = ff.extFiles();
            for (var i = 0; i < matches.length; i++) {
                grunt.log.ok(matches[i].src + ' -> ' + matches[i].dst);
                grunt.file.copy(matches[i].src, matches[i].dst);
            }
        },

        index: function() {

            grunt.log.ok("Build: index");
            grunt.log.ok("");

            var jsFiles = ff.flatten(ff.includeJsFiles());
            grunt.log.ok('- Found ' + jsFiles.length + " Javascript-files.");
            var cssFiles = ff.flatten(ff.includeCssFiles());
            grunt.log.ok('- Found ' + cssFiles.length + " CSS-files.");

            var indices = ff.flatten(ff.indexFiles());
            for (var i=0; i < indices.length; i++) {
                grunt.log.ok('Updating ' + indices[i]);
                buildIndex(indices[i], jsFiles, cssFiles);
            }
        },

        dist: function() {

            var i, dst;

            grunt.log.ok("Build: dist");
            grunt.log.ok("");

            grunt.log.ok("Copying media files...");
            grunt.log.ok("");
            var matches = ff.distFilesUncompressed();
            for (i = 0; i < matches.length; i++) {
                dst = path.join('dist', matches[i].dst);
                grunt.log.ok(matches[i].dst + ' -> ' + dst);
                grunt.file.copy(matches[i].dst, dst);
            }

            grunt.log.ok("Compressing CSS...");
            grunt.log.ok("");
            var settings = {all: {files: {}}};
            settings.all.files['dist/' + ff.getConfig('name') + '.min.css'] = ff.flatten(ff.includeCssFiles());
            grunt.config.set('cssmin', settings);
            grunt.task.run('cssmin');

            grunt.log.ok("Collecting Javascript...");
            grunt.log.ok("");
            settings = {all: {}};
            settings.all.src = ff.flatten(ff.includeJsFiles());
            settings.all.dest = 'dist/' + ff.getConfig('name') + '.js';
            grunt.config.set('concat', settings);
            grunt.task.run('concat');

            grunt.log.ok("Compressing Javascript...");
            grunt.log.ok("");
            var banner = '';
            banner += '/* ' + package.name + ' v' + package.version + '\n';
            banner += ' * Copyright (c) ' + grunt.template.today("yyyy") + ' ' + package.author.name + '\n';
            banner += ' */\n';

            settings = {options: {banner: banner}, dist: {}};
            settings.dist.src = 'dist/' + ff.getConfig('name') + '.js';
            settings.dist.dest = 'dist/' + ff.getConfig('name') + '.min.js';
            grunt.config.set('uglify', settings);
            grunt.task.run('uglify');

            // Build index file(s).
            grunt.log.ok("Building index...");
            var indices = ff.flatten(ff.appIndexFiles());
            for (i = 0; i < indices.length; i++) {
                dst = 'dist/' + indices[i];
                grunt.log.ok(indices[i] + ' -> ' + dst);
                grunt.file.copy(indices[i], dst);
                buildIndex(dst, [ff.getConfig('name') + '.min.js'], [ff.getConfig('name') + '.min.css']);
            }
        },

        verify: function() {
            grunt.log.ok("Build: verify");
            grunt.log.ok("");
            var settings = {
                all: ff.flatten(ff.srcFiles().concat(ff.otherFiles())),
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

        version: function(version) {
            if (arguments.length === 0) {
                grunt.log.ok("");
                grunt.log.ok("Current version is", package.version);
                grunt.log.ok("");
                grunt.log.ok("You can make official release by giving new version number like 'x.y.z' or");
                grunt.log.ok("you can start next release candidate by add postfix 'x.y.z-beta'.");
                grunt.log.ok("To set new version, you run command: 'grunt version:x.y.z'");
            } else {
                if (!version.match(/^\d+\.\d+\.\d+(-beta)?$/)) {
                    grunt.fail.fatal("Invalid version '" + version + "'.");
                }
                // Update package.
                var debugMode = (version.substr(version.length-4) === 'beta');
                package.version = version;
                grunt.file.write('package.json', JSON.stringify(package, null, 2));
                grunt.log.ok("Set version", package.version, "to package.json.");

                // Update other files.
                var files = ff.flatten(ff.configFiles());
                for (var i=0; i<files.length; i++) {
                    var file = files[i];
                    var newSettings, settings = grunt.file.read(file);
                    newSettings = settings.replace(/^VERSION\s*=\s*'.*'/gm, "VERSION = '" + package.version + "'");
                    if (newSettings !== settings) {
                        grunt.log.ok("Updated version", package.version, "to", file);
                        settings = newSettings;
                    }
                    newSettings = settings.replace(/^DEBUG\s*=\s[^;]*/gm, "DEBUG = " + debugMode.toString());
                    if (newSettings !== settings) {
                        grunt.log.ok("Set the debug mode to", debugMode, "in", file);
                    }
                    grunt.file.write(file, newSettings);
                }
            }
        },

        todo: function(die) {

            var files = ff.flatten(ff.workTextFiles());
            var TODO = "TODO" + ":";
            for (var i=0; i<files.length; i++) {
                var seen = false;
                var lines = grunt.file.read(files[i]).split("\n");
                for (var j=0; j<lines.length; j++) {
                    if( lines[j].indexOf(TODO) >= 0) {
                        if (die === 'die') {
                            grunt.fail.fatal("There are unfinished TODO-entries in line " + (j+1) +" of '" + files[i] + "'.\nSee 'grunt todo' for list of them.");
                        }
                        if (!seen) {
                            seen = true;
                            grunt.log.ok("");
                            grunt.log.ok(("[ " + files[i] + "]")["blue"]);
                            grunt.log.ok("");
                        }
                        grunt.log.ok(("Line " + j+1 + "")["green"], lines[j].trim());
                    }
                }
            }
        },

        test: function(testType) {

            var src = ff.flatten(ff.srcFiles());
            var specs = ff.flatten(ff.unitTestFiles());
            var settings = {
                all: {
                    src: src,
                    options: {
                        specs: specs
                    },
                }
            };
            grunt.config.set('jasmine', settings);
            grunt.task.run('jasmine');
        },
    };

    grunt.registerTask('info', 'Display summary of the configured files and locations.', build.info);
    grunt.registerTask('libs', 'Update fresh copies of libraries from installed node-modules.', build.libs);
    grunt.registerTask('index', 'Scan all configured javascript and css files and update html-files using them.', build.index);
    grunt.registerTask('verify', 'Run all verifications required for valid build.', build.verify);
    grunt.registerTask('dist', 'Collect and minify all application files into the dist-directory.', build.dist);
    grunt.registerTask('version', 'Query and mark the version to the source files.', build.version);
    grunt.registerTask('todo', 'Scan for TODO-entries from the source code and display them.', build.todo);
    grunt.registerTask('test', 'Run all tests.', build.test);

    grunt.registerTask('usage', 'Handle all steps for standalone application Javascript development.', function(op) {
        var excludes = ['default', 'usage', 'availabletasks', 'jshint', 'uglify', 'cssmin', 'concat', 'jasmine'];
        grunt.initConfig({availabletasks: {tasks: {options: {filter: 'exclude', tasks: excludes}}}});
        grunt.task.run(['availabletasks']);
    });
};
