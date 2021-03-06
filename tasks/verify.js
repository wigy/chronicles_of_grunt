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

    var cog = require('../lib/cog.js')(grunt);
    var ff = require('../lib/file-filter.js')(grunt);
    var log = require('../lib/log.js')(grunt);

    var modules = cog.prefix();

    grunt.loadTasks(modules + 'grunt-contrib-jshint/tasks/');
    grunt.loadTasks(modules + 'grunt-contrib-csslint/tasks/');

    function taskVerify(what) {

        var settings, files;

        log.info("");

        // Verify Javascript
        if (!what || what === "js") {
            files = ff.flatten(ff.allJavascriptFiles());
            if (files.length) {
                settings = {
                    all: files,
                    options: {
                        curly: true,
                        eqeqeq: true,
                        immed: true,
                        latedef: true,
                        newcap: true,
                        noarg: true,
                        sub: true,
                        esnext: true,
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
                for (var i = 0; i < files.length; i++) {
                    if (grunt.file.read(files[i]).indexOf('\t') >= 0) {
                        fails.push(files[i]);
                    }
                }
                if (fails.length) {
                    grunt.fail.fatal("The following files have tabs:\n" + fails.join("\n"));
                }
                // Then use JSHint.
                grunt.config.set('jshint', settings);
                grunt.task.run('jshint');
            }
        }

        // Verify CSS
        if (!what || what === "css") {
            files = ff.flatten(ff.cssFiles());
            if (files.length) {
                settings = {
                    src: files,
                    options: {
                        "fallback-colors": false
                    },
                };
                grunt.config.set('csslint', settings);
                grunt.task.run('csslint');
            }
        }

        // Verify Python
        if (!what || what === "python") {
            var skip = cog.getOption('python_skip_verify');
            files = ff.flatten(ff.removeDuplicates(ff.pythonFiles(), ff.files(skip)));
            files = files.map(function(name) {return name.replace(/([ '"])/g, '\\$1');});
            if (files.length) {
                var linelen = cog.getOption('python_line_length');
                settings = {
                    pep8: 'pep8 --show-source --max-line-length=' + linelen + ' ' + files.join(' ')
                };
                grunt.config.set('shell', settings);
                grunt.task.run('shell');
            }
        }
    }

    grunt.registerTask('verify', 'Run all verifications required for valid build.', taskVerify);
};
