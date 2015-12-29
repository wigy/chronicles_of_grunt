/*
 * Chronicles of Grunt
 *
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
    var templates = require('./templates.js')(grunt);

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
    grunt.loadTasks(modules + 'grunt-shell/tasks/');
    grunt.loadTasks(modules + 'grunt-ngdocs/tasks/');

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

        log.info("");
        log.info("Project: " + ff.getConfig('name'));
        log.info("Title: " + ff.getConfig('title'));
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
        dumpFiles('Picture source files', ff.picSrcFiles);
        dumpFiles('Grunt task-files', ff.taskFiles);
        dumpFiles('Other Javascript-files', ff.otherFiles);
        dumpFiles('Unit test libraries', ff.unitTestLibraryFiles);
        dumpFiles('Unit test CSS-files', ff.includeUnitTestCssFiles);
        dumpFiles('Unit tests', ff.unitTestFiles);
        dumpFiles('Tools (shell script)', ff.toolsShellFiles);
    }

    function taskLibs() {
        log.info("");
        var matches = ff.extFiles();
        for (var i = 0; i < matches.length; i++) {
            log.info(matches[i].src + ' -> ' + matches[i].dst);
            grunt.file.copy(matches[i].src, matches[i].dst);
        }
    }

    function taskIndex() {

        var i, indices, jsFiles, cssFiles;

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
                ff.writeIndex(indices[i], jsFiles, cssFiles);
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
                ff.writeIndex(indices[i], jsFiles, cssFiles);
            }
        }
    }

    function taskDist() {

        var i, dst, dist, settings;

        log.info("");

        var matches = ff.distUncompressedFiles();
        if (matches.length) {
            log.info("");
            log.info("Copying media files...");
            log.info("");
            for (i = 0; i < matches.length; i++) {
                log.info(matches[i].src + ' -> ' + matches[i].dst);
                grunt.file.copy(matches[i].src, matches[i].dst);
            }
        }

        // Copy libraries.
        var compressedJsFiles = [];
        var libs = ff.distLibFiles();
        if (libs.length) {
            log.info("");
            log.info("Copying libraries...");
            log.info("");
            for (i = 0; i < libs.length; i++) {
                log.info(libs[i].src + ' -> ' + libs[i].dst);
                grunt.file.copy(libs[i].src, libs[i].dst);
                compressedJsFiles.push(libs[i].dst.replace(/dist\//, ''));
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
            dist = ff.distCssFiles()[0];
            compressedCssFiles.push(dist.dst.replace(/dist\//, ''));
            settings.all.files[dist.dst] = ff.flatten(cssFiles);
            grunt.config.set('cssmin', settings);
            grunt.task.run('cssmin');
        }

        // Compress code.
        var jsFiles = ff.srcFiles();
        if (jsFiles.length) {
            log.info("");
            log.info("Collecting Javascript...");
            log.info("");

            dist = ff.distJsFiles()[0];

            settings = {all: {}};
            settings.all.src = ff.flatten(jsFiles);
            settings.all.dest = dist.src;
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
            compressedJsFiles.push(dist.dst.replace(/dist\//, ''));
            settings.dist.src = dist.src;
            settings.dist.dest = dist.dst;
            grunt.config.set('uglify', settings);
            grunt.task.run('uglify');
            grunt.task.run('cleanup');
        }

        // Build index file(s).
        var indices = ff.distIndexFiles();
        if (indices.length) {
            log.info("");
            log.info("Building index...");
            log.info("");
            for (i = 0; i < indices.length; i++) {
                log.info(indices[i].src + ' -> ' + indices[i].dst);
                grunt.file.copy(indices[i].src, indices[i].dst);
                ff.writeIndex(indices[i].dst, compressedJsFiles, compressedCssFiles);
            }
        }
    }

    function taskVerify(what) {

        var settings;

        log.info("");
        if (!what || what === "js") {
            settings = {
                all: ff.flatten(ff.allSrcFiles().concat(ff.unitTestFiles())),
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
            // Check for tabs first.
            var fails = [];
            for (var i = 0; i < settings.all.length; i++) {
                if (grunt.file.read(settings.all[i]).indexOf('\t') >= 0) {
                    fails.push(settings.all[i]);
                }
            }
            if (fails.length) {
                grunt.fail.fatal("The following files have tabs:\n" + fails.join("\n"));
            }
            // Then use JSHint.
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

        var i,j;
        var count = 0;
        var files = ff.flatten(ff.workTextFiles());
        var TODO = "TODO" + ":";

        for (i=0; i<files.length; i++) {
            var seen = false;
            var lines = grunt.file.read(files[i]).split("\n");
            for (j=0; j<lines.length; j++) {
                if( lines[j].indexOf(TODO) >= 0) {
                    count++;
                    if (!seen) {
                        seen = true;
                        log.info("");
                        log.info(files[i]["blue"]);
                        log.info("");
                    }
                    log.info(("  Line " + (j+1) + "")["green"], lines[j].trim());
                }
            }
        }

        var parsed = readme.parse();
        if (parsed.next_version.not_yet_done.length) {
            log.info("");
            log.info(("README.md")["blue"]);
            log.info("");
            for (i=0; i<parsed.next_version.not_yet_done.length; i++) {
                log.info("  Not Yet Done "["green"], parsed.next_version.not_yet_done[i]);
                count++;
            }
        }

        log.info("");
        log.info(("TODO-entries open: " + count)["magenta"]);
        log.info("");
        if (count && die === 'die') {
            grunt.fail.fatal("There are unfinished TODO-entries that needs to be resolved.\n" +
                                "Please cancel or implement them or gather them to the future version plan.");
        }
    }

    function taskTest(which) {

        /**
          * Check the selected libraries for testing system.
          */
        function configuredUnitTesting() {
            var lib = ff.getConfig('test.unit.lib');
            if (lib === 'jasmine' || lib.indexOf('jasmine') >= 0) {
                return 'jasmine';
            }
            if (lib === 'nodeunit' || lib.indexOf('nodeunit') >= 0) {
                return 'nodeunit';
            }
            return null;
        }

        var settings;

        // Select test runner.
        var type = configuredUnitTesting();
        if (!type) {
            grunt.fail.fatal("Testing system is not configured. Please set test.unit.lib to the 'jasmine' or 'nodeunit'.");
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
        // Check that something has been done.
        var parsed = readme.parse();
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
        if (args.indexOf('files') < 0) {
            tasks.push('files:die');
        }
        if (args.indexOf('test') < 0) {
            tasks.push('test');
        }
        if (args.indexOf('build') < 0) {
            tasks.push('build');
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

    function taskDocs() {

        var src = ff.flatten(ff.allSrcFiles());
        var engine = ff.getConfig('docs.engine') || 'jsdoc';
        var dst = 'docs';
        var settings;

        if (engine === 'ngdocs') {

            settings = {
                ngdocs: {
                    src: src,
                    title: 'Documentation',
                    api: true,
                    options: {
                        startPage: '/ngdocs',
                        dest: dst,
                        sourceLink: true,
                        title: ff.getConfig('title') || ff.getConfig('name')
                    }
                }
            };

        } else if (engine === 'jsdoc') {

            settings = {
                docs: {
                    src: src,
                    options: {
                        destination: dst,
                    }
                }
            };

        } else {
            grunt.fail.fatal("Cannot recognize configured documentation engine docs.engine: '" + engine +"'.");
        }

        grunt.config.set(engine, settings);
        grunt.task.run(engine);
    }

    function taskCleanup() {

        var settings = {
            all: ['dist/' + ff.getConfig('name') + '.js']
        };

        grunt.config.set('clean', settings);
        grunt.task.run('clean');
    }

    function taskAuto(what) {

        var options = {spwan: false, interrupt: true};

        var settings = {
            docs: {
                files: ff.flatten(ff.allSrcFiles()),
                tasks: ['docs'],
                options: options
            },
            test: {
                files: ff.flatten(ff.allSrcFiles().concat(ff.unitTestFiles())),
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

        if (what && !(what in settings)) {
            grunt.fail.fatal("Invalid argument for auto-task. Only supported are " + Object.keys(settings) + ".");
        }
        grunt.config.set('watch', settings);
        grunt.task.run(what ? 'watch:' + what : 'watch');
    }

    function taskFiles(die) {
        var files = ff.filesInRepository();
        var map  = ff.fileCategoryMap();

        log.info("");
        var count = 0;
        for (var i = 0; i < files.length; i++) {
            if (!map[files[i]]) {
                log.info('? ' + files[i]);
                count++;
            } else if (die === 'show') {
                log.info(map[files[i]] + ' ' + files[i]);
            }
        }
        if (count) {
            log.info("");
            log.info(count + " file(s) unknown.");
            if (die === 'die') {
                grunt.fail.fatal("There are files in the repository that are not known.\n" +
                                 "Please add them to the appropriate categories in Gruntfile.js.\n" +
                                 "If there are no category for them, then just add them to the 'ignore' category.");
            }
        } else {
            log.info("All files known!");
        }
    }

    function taskBuild(what) {

        var args = Array.prototype.slice.call(arguments);

        // By default, build all.
        if (args.length === 0) {
            // Resolve from the config, what is buildable.
            args = [];
            if (ff.getConfig('media.src.pics.dst')) {
                args.push('pics');
            }
            if (ff.getConfig('media.src.sounds.dst')) {
                args.push('sounds');
            }
            if (ff.generatedFiles().length) {
                args.push('templates');
            }
        }

        var files = [];
        var target = null;
        var convert = [];

        // Support function to substitute path variables.
        function subst(str, file, dst) {
            if (dst !== undefined) {
                str = str.replace(/\{\{DST\}\}/g, dst);
            }
            var dir = path.dirname(file);
            str = str.replace(/\{\{SRC\}\}/g, file);
            var name = path.basename(file);
            str = str.replace(/\{\{NAME\}\}/g, name);
            name = name.replace(/\.\w+$/, '');
            str = str.replace(/\{\{BASENAME\}\}/g, name);
            str = str.replace(/\{\{DIR\}\}/g, dir);
            var parts =     dir.split(path.sep);
            parts.splice(0, 1);
            str = str.replace(/\{\{SUBDIR\}\}/g, path.join.apply(null, parts));
            parts.splice(0, 1);
            str = str.replace(/\{\{SUBSUBDIR\}\}/g, path.join.apply(null, parts));
            return str;
        }

        var settings = {all: {command: []}};

        for (var i = 0; i < args.length; i++) {

            var options;

            // Show progress.
            log.info("");
            log.info(("Building " + args[i])['green']);

            files = [];
            target = null;
            convert = null;

            // Resolve parameters.
            if (args[i] === 'pics') {
                files = ff.flatten(ff.picSrcFiles());
                target = ff.getConfig('media.src.pics.dst');
                convert = ff.getConfig('media.src.pics.convert');
            } else if (args[i] === 'sounds'){
                files = ff.flatten(ff.soundSrcFiles());
                target = ff.getConfig('media.src.sounds.dst');
                convert = ff.getConfig('media.src.sounds.convert');
            } else if (args[i] === 'templates'){
                files = [ff.flatten(ff.htmlTemplateFiles())];
                if (!files[0].length) {
                    grunt.fail.fatal("No template files defined.");
                }
                target = ff.generatedFiles('templates')[0].dst;
                convert = templates.generate;
                if (ff.getConfig('external.lib').indexOf('angular') >= 0 || ff.getConfig('external.lib').indexOf('coa') >= 0) {
                    options = {template: ff.root() + 'templates/angular.js'};
                } else {
                    grunt.fail.fatal("Cannot determine template system based on external libraries.");
                }
            } else {
                grunt.fail.fatal("Don't know how to build " + args[i] + ".");
            }

            // Validate parameters.
            if (!target) {
                grunt.fail.fatal("Target is not defined for building " + args[i] + ".");
            }
            if (!convert) {
                grunt.fail.fatal("Conversion commands is not defined for building " + args[i] + ".");
            }

            // Collect conversion commands.
            for (var j = 0; j < files.length; j++) {

                // Find the destination file and create directory.
                var dst = subst(target, files[j]);

                grunt.file.mkdir(path.dirname(dst));
                log.info("");
                if (files[j] instanceof Array) {
                    for (var n = 0; n < files[j].length; n++) {
                        log.info("  " + files[j][n] + (n === files[j].length - 1 ?  ' -> ' + dst : ''));
                    }
                } else {
                    log.info("  " + files[j] + ' -> ' + dst);
                }

                // Check if build is needed.
                if (fs.existsSync(dst)) {
                    if (fs.lstatSync(dst).mtime.getTime() > fs.lstatSync(files[j]).mtime.getTime()) {
                        log.info("  up to date"["yellow"]);
                        continue;
                    } else {
                        fs.unlink(dst);
                    }
                }

                // Resolve conversion.
                if (typeof(convert) === 'string') {
                    convert = [convert];
                } else if (typeof(convert) === 'function') {
                    // Execute functions directly.
                    log.info("  <internal function>"["cyan"]);
                    convert(options.template, files, dst);
                    continue;
                }

                // Add conversion commands to the queue.
                for (var k = 0; k < convert.length; k++) {
                    var cmd = subst(convert[k], files[j], dst);
                    log.info("  " + cmd["cyan"]);
                    settings.all.command.push(cmd);
                }
            }
        }

        // Execute all shell commands.
        if (settings.all.command.length) {
            settings.all.command = settings.all.command.join(' && ');
            grunt.config.set('shell', settings);
            grunt.task.run('shell');
        }
    }

    grunt.registerTask('info', 'Display summary of the configured files and locations.', taskInfo);
    grunt.registerTask('libs', 'Update fresh copies of libraries from installed node-modules.', taskLibs);
    grunt.registerTask('index', 'Scan all configured javascript and css files and update html-files using them.', taskIndex);
    grunt.registerTask('verify', 'Run all verifications required for valid build.', taskVerify);
    grunt.registerTask('dist', 'Collect and minify all application files into the dist-directory.', taskDist);
    grunt.registerTask('version', 'Query or mark the version to the source files.', taskVersion);
    grunt.registerTask('todo', 'Scan for remaining TODO-entries from the source code and display them.', taskTodo);
    grunt.registerTask('test', 'Run all tests.', taskTest);
    grunt.registerTask('prerelease', 'Pre checks for the relase.', taskPreRelease);
    grunt.registerTask('postrelease', 'File updating tasks relase.', taskPostRelease);
    grunt.registerTask('release', 'Make all sanity checks and if passed, create next release version.', taskRelease);
    grunt.registerTask('docs', 'Build all documentation.', taskDocs);
    grunt.registerTask('cleanup', 'Remove unnecessary files.', taskCleanup);
    grunt.registerTask('auto', 'Automatically run tasks when files have changed.', taskAuto);
    grunt.registerTask('files', 'Analyse and list all unknown files in the repository.', taskFiles);
    grunt.registerTask('build', 'Compile files that are created from source files.', taskBuild);

    grunt.registerTask('usage', 'Display summary of available tasks.', function() {
        var excludes = ['default', 'usage', 'availabletasks', 'jshint', 'uglify', 'cssmin', 'concat', 'jasmine',
                        'csslint', 'nodeunit', 'shell', 'prerelease', 'postrelease', 'jsdoc', 'clean', 'cleanup',
                        'watch', 'shell'];
        grunt.initConfig({availabletasks: {tasks: {options: {filter: 'exclude', tasks: excludes}}}});
        grunt.task.run(['availabletasks']);
    });
};
