/*
 * Chronicles of Grunt
 *
 * (C) 2016 Tommi Ronkainen
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

    // TODO: Grep through task and check these modules are loaded where needed.
    // Get the package configuration.
    var pckg = grunt.file.readJSON('package.json');

    // Load Node-modules.
    var path = require('path');
    var colors = require('colors');
    var fs = require('fs');
    var ff = require('../lib/file-filter.js')(grunt);
    var log = require('../lib/log.js')(grunt);
    var readme = require('../lib/readme.js')(grunt);
    var templates = require('../lib/templates.js')(grunt);

    // Load tasks needed.
    var modules = ff.prefix();

    grunt.loadTasks(modules + 'grunt-available-tasks/tasks/');
    grunt.loadTasks(modules + 'grunt-jsdoc/tasks/');
    grunt.loadTasks(modules + 'grunt-contrib-watch/tasks/');
    grunt.loadTasks(modules + 'grunt-shell/tasks/');
    grunt.loadTasks(modules + 'grunt-ngdocs/tasks/');

    function taskDocs() {

        var src = ff.flatten(ff.allSrcFiles());
        var engine = ff.getConfig('docs.engine') || 'jsdoc';
        var dst = ff.pathDocs();
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
            all: [ff.pathDist() + ff.getConfig('name') + '.js']
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

        var build = {
            pics: {
                files: ff.flatten(ff.picSrcFiles()),
                tasks: ['build:pics'],
                options: options
            },
            sounds: {
                files: ff.flatten(ff.soundSrcFiles()),
                tasks: ['build:sounds'],
                options: options
            },
            templates: {
                files: ff.flatten(ff.htmlTemplateFiles()),
                tasks: ['build:templates'],
                options: options
            },
        };

        if (ff.configuredUnitTesting()) {
            settings.test = {
                files: ff.flatten(ff.allSrcFiles().concat(ff.unitTestFiles())),
                tasks: ['test'],
                options: options
            };
        }

        if (what === 'build') {
            settings = build;
            what = null;
        } else {
            Object.assign(settings, build);
        }

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
        var docs = ff.pathDocs();
        for (var i = 0; i < files.length; i++) {
            if (!map[files[i]]) {
                // Check common output files.
                if (files[i].substr(0, docs.length) === docs) {
                    continue;
                } else {
                    log.info('? ' + files[i]);
                    count++;
                }
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
            if (ff.generatedJsFiles().length) {
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
                files = [ff.flatten(ff.htmlTemplateFiles())]; // Single target, multiple source files.
                if (!files[0].length) {
                    grunt.fail.fatal("No template files defined.");
                }
                target = ff.generatedJsFiles('templates')[0].dst;
                if (ff.getConfig('external.lib').indexOf('angular') >= 0 || ff.getConfig('external.lib').indexOf('coa') >= 0) {
                    /*jshint loopfunc: true */
                    convert = function(files) {
                        return templates.generate(ff.root() + 'templates/angular.js', files[0]);
                    };
                    /*jshint loopfunc: false */
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

                var n;

                // Find the destination file and create directory.
                var dst = subst(target, files[j]);

                grunt.file.mkdir(path.dirname(dst));
                log.info("");
                if (files[j] instanceof Array) {
                    for (n = 0; n < files[j].length; n++) {
                        log.info("  " + files[j][n] + (n === files[j].length - 1 ?  ' -> ' + dst : ''));
                    }
                } else {
                    log.info("  " + files[j] + ' -> ' + dst);
                }

                // Check if build is needed comparing source file dates versus destination file dates.
                if (fs.existsSync(dst)) {

                    var changed = false;

                    if (files[j] instanceof Array) {
                        for (n = 0; n < files[j].length; n++) {
                            if (fs.lstatSync(dst).mtime.getTime() < fs.lstatSync(files[j][n]).mtime.getTime()) {
                                changed = true;
                                break;
                            }
                        }
                    } else {
                        changed = fs.lstatSync(dst).mtime.getTime() < fs.lstatSync(files[j]).mtime.getTime();
                    }

                    if (!changed) {
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
                    log.info("  {internal function}"["cyan"]);
                    grunt.file.write(target, convert(files));
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

    grunt.registerTask('docs', 'Build all documentation.', taskDocs);
    grunt.registerTask('cleanup', 'Remove unnecessary files.', taskCleanup);
    grunt.registerTask('auto', 'Automatically run tasks when files have changed.', taskAuto);
    grunt.registerTask('files', 'Analyse and list all unknown files in the repository.', taskFiles);
    grunt.registerTask('build', 'Compile files that are created from source files.', taskBuild);

    // TODO: Rename this file as usage.js once all tasks moved.
    grunt.registerTask('usage', 'Display summary of available tasks.', function() {
        var excludes = ['default', 'usage', 'availabletasks', 'jshint', 'uglify', 'cssmin', 'concat', 'jasmine',
                        'csslint', 'nodeunit', 'shell', 'prerelease', 'postrelease', 'jsdoc', 'clean', 'cleanup',
                        'watch', 'shell', 'ngdocs'];
        grunt.initConfig({availabletasks: {tasks: {options: {filter: 'exclude', tasks: excludes}}}});
        grunt.task.run(['availabletasks']);
    });
};
