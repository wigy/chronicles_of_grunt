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

    var path = require('path');
    var fs = require('fs');
    var colors = require('colors');
    var cog = require('../lib/cog.js')(grunt);
    var ff = require('../lib/file-filter.js')(grunt);
    var log = require('../lib/log.js')(grunt);
    var templates = require('../lib/templates.js')(grunt);
    var modules = ff.prefix();

    grunt.loadTasks(modules + 'grunt-shell/tasks/');

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
                if (ff.configuredFramework() === 'angular') {
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
                var dst;

                log.info("");
                if (files[j] instanceof Array) {
                    for (n = 0; n < files[j].length; n++) {
                        dst = subst(target, files[j][n]);
                        grunt.file.mkdir(path.dirname(dst));
                        log.info("  " + files[j][n] + (n === files[j].length - 1 ?  ' -> ' + dst : ''));
                    }
                } else {
                    dst = subst(target, files[j]);
                    grunt.file.mkdir(path.dirname(dst));
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

    grunt.registerTask('build', 'Compile files that are created from source files.', taskBuild);
};
