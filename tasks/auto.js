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
    var modules = cog.prefix();

    grunt.loadTasks(modules + 'grunt-contrib-watch/tasks/');

    function taskAuto(what) {

        var options = {spawn: false, interrupt: true};

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

        if (cog.configuredUnitTesting()) {
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

    grunt.registerTask('auto', 'Automatically run tasks when files have changed.', taskAuto);
};
