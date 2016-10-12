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
    var modules = ff.prefix();
    var log = require('../lib/log.js')(grunt);

    grunt.loadTasks(modules + 'grunt-contrib-connect/tasks/');
    grunt.loadTasks(modules + 'grunt-contrib-watch/tasks/');
    grunt.loadTasks(modules + 'grunt-concurrent/tasks/');

    function taskServer(port, what) {

        if (port) {
            port = parseInt(port);
        }
        if (!port) {
            port = 9000;
        }

        // Basic server launches two processes: one 'autoreload' for watching file changes and one static file server 'files'.
        if (!what) {

            var concurrent = {
                connect: {
                    options: {
                        logConcurrentOutput: true
                    },
                    tasks: ['server:' + port + ':files', 'server:' + (port + 1) + ':autoreload']
                }
            };

            grunt.config.set('concurrent', concurrent);
            grunt.task.run('concurrent');

            return;
        }

        // This server watches for changes and server autoreload requests.
        if (what === 'autoreload') {

            var watch = {
                all: {
                    files: ff.flatten(ff.appIndexFiles().concat(ff.mediaFiles()).concat(ff.includeJsFiles()).concat(ff.includeCssFiles())),
                    options: {
                        livereload: port
                    },
                    tasks: []
                }
            };

            grunt.config.set('watch', watch);
            grunt.task.run('watch:all');

            return;
        }

        // This server serves static files.
        if (what === 'files') {

            var connect = {
                server: {
                    options: {
                        protocol: 'http',
                        port: port,
                        keepalive: true,
                        livereload: port + 1
                    }
                }
            };


            grunt.config.set('connect', connect);
            grunt.task.run('connect:server');

            return;
        }

        grunt.fail.fatal("Invalid argument '" + what + "'for server.");
    }

    grunt.registerTask('server', 'Start a static file server for development with automatic page reload.', taskServer);
};