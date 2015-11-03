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
    var config = grunt.config.get('build') || {options: {}};
    var work_dir = config.options.work_dir || '.';
    var package = grunt.file.readJSON('package.json');

    // Load tasks.
    if (config.options.cog_development) {
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

    // Load Node-modules.
    var path = require('path');
    var ff = require('./file-filter.js');

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
	 * Safe fetch of configuration variable.
	 */
	function getConfig(name) {
		var ret = config.options;
		if (!name) {
			return ret;
		}
		var parts = name.split('.');
		for (var i=0; i < parts.length; i++) {
			if (!ret) {
				return null;
			}
			ret = ret[parts[i]];
		}

		return ret;
	}

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
        return files(getConfig('external.lib'), 'lib');
    }

    /**
     * Find all exyternal CSS files.
     */
     function extCssFiles() {
         return files(getConfig('external.css'), 'css');
     }

    /**
     * Find all external font files.
     */
    function extFontFiles() {
        return files(getConfig('external.fonts'), 'fonts');
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
        return files(getConfig('index.app'), 'index');
    }

    /**
     * Find test index files.
     */
    function testIndexFiles() {
        return files(getConfig('index.test'), 'index');
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
        return files(getConfig('src.config'), 'config');
    }

    /**
     * Find all models.
     */
    function modelFiles() {
        return removeDuplicates(files(getConfig('src.models'), 'models'), configFiles());
    }

    /**
     * Find all data files (not models).
     */
    function dataFiles() {
        return removeDuplicates(files(getConfig('src.data'), 'data'), configFiles().concat(modelFiles()));
    }

    /**
     * Find all source code files (not data nor models).
     */
    function codeFiles() {
        return removeDuplicates(files(getConfig('src.code'), 'code'), configFiles().concat(modelFiles()).concat(dataFiles()));
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
        return removeDuplicates(files(getConfig('src.css'), 'css'), extCssFiles());
    }

    /**
     * Find all graphics files.
     */
    function picFiles() {
        return files(getConfig('src.pics'), 'pics');
    }

    /**
     * Find all audio files.
     */
    function soundFiles() {
        return files(getConfig('src.sounds'), 'sounds');
    }

    /**
     * Find all text based work files.
     */
    function workTextFiles() {

        return srcFiles().concat(cssFiles());
    }

    /**
     * Find all work files.
     */
    function workFiles() {

        return workTextFiles().concat(picFiles()).concat(soundFiles());
    }

    /**
     * Find all code files needed to include in HTML index.
     */
    function includeJsFiles() {
        return excludeFiles(extLibFiles(), /\.map$/).concat(srcFiles());
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
     * Find all unit-test files.
     */
    function unitTestFiles() {
        return files(getConfig('test.unit'), 'test');
    }

    /**
     * Find all test files.
     */
    function testFiles() {
        return unitTestFiles();
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
     * Remove specs whose destination matches to the given regex pattern.
     */
    function excludeFiles(list, regex) {
        var ret = [];
        for (var i=0; i < list.length; i++) {
            if (!regex.test(list[i].dst)) {
                ret.push(list[i]);
            }
        }
        return ret;
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

			grunt.log.ok("Project: " + getConfig('name'));
			grunt.log.ok("Work dir: " + work_dir);
            dumpFiles('External Libraries', extLibFiles);
            dumpFiles('External CSS-files', extCssFiles);
            dumpFiles('External Fonts', extFontFiles);
            dumpFiles('Index files', indexFiles);
            dumpFiles('Configuration and global utilities', configFiles);
            dumpFiles('Model files', modelFiles);
            dumpFiles('Data files', dataFiles);
            dumpFiles('Code files', codeFiles);
            dumpFiles('CSS-files', cssFiles);
            dumpFiles('Unit tests', unitTestFiles);
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

            grunt.log.ok("Build: index");
            grunt.log.ok("");

            var jsFiles = flatten(includeJsFiles());
            grunt.log.ok('- Found ' + jsFiles.length + " Javascript-files.");
            var cssFiles = flatten(includeCssFiles());
            grunt.log.ok('- Found ' + cssFiles.length + " CSS-files.");

            var indices = flatten(indexFiles());
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
            var matches = distFilesUncompressed();
            for (i = 0; i < matches.length; i++) {
                dst = path.join('dist', matches[i].dst);
                grunt.log.ok(matches[i].dst + ' -> ' + dst);
                grunt.file.copy(matches[i].dst, dst);
            }

            grunt.log.ok("Compressing CSS...");
            grunt.log.ok("");
            var settings = {all: {files: {}}};
            settings.all.files['dist/' + getConfig('name') + '.min.css'] = flatten(includeCssFiles());
            grunt.config.set('cssmin', settings);
            grunt.task.run('cssmin');

            grunt.log.ok("Collecting Javascript...");
            grunt.log.ok("");
            settings = {all: {}};
            settings.all.src = flatten(includeJsFiles());
            settings.all.dest = 'dist/' + getConfig('name') + '.js';
            grunt.config.set('concat', settings);
            grunt.task.run('concat');

            grunt.log.ok("Compressing Javascript...");
            grunt.log.ok("");
            var banner = '';
            banner += '/* ' + package.name + ' v' + package.version + '\n';
            banner += ' * Copyright (c) ' + grunt.template.today("yyyy") + ' ' + package.author + '\n';
            banner += ' */\n';

            settings = {options: {banner: banner}, dist: {}};
            settings.dist.src = 'dist/' + getConfig('name') + '.js';
            settings.dist.dest = 'dist/' + getConfig('name') + '.min.js';
            grunt.config.set('uglify', settings);
            grunt.task.run('uglify');

            // Build index file(s).
            grunt.log.ok("Building index...");
            var indices = flatten(appIndexFiles());
            for (i = 0; i < indices.length; i++) {
                dst = 'dist/' + indices[i];
                grunt.log.ok(indices[i] + ' -> ' + dst);
                grunt.file.copy(indices[i], dst);
                buildIndex(dst, [getConfig('name') + '.min.js'], [getConfig('name') + '.min.css']);
            }
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
                var files = flatten(configFiles());
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

            var files = flatten(workTextFiles());
            var TODO = "TODO" + ":";
            for (var i=0; i<files.length; i++) {
                var seen = false;
                var lines = grunt.file.read(files[i]).split("\n");
                for (var j=0; j<lines.length; j++) {
                    if( lines[j].indexOf(TODO) >= 0) {
                        if (die == 'die') {
                            grunt.fail.fatal("There are unfinished TODO-entries in line " + (j+1) +" of '" + files[i] + "'.\nSee 'grunt todo' for list of them.");
                        }
                        if (!seen) {
                            seen = true;
                            grunt.log.ok("");
                            grunt.log.ok("[", files[i], "]");
                            grunt.log.ok("");
                        }
                        grunt.log.ok("Line", j+1, ":", lines[j]);
                    }
                }
            }
        },

        test: function(testType) {

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
