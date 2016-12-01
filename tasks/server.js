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

    var serveStatic = require('serve-static');

    var cog = require('../lib/cog.js')(grunt);
    var ff = require('../lib/file-filter.js')(grunt);
    var modules = cog.prefix();
    var log = require('../lib/log.js')(grunt);
    var server = require('../lib/server.js')(grunt);

    grunt.loadTasks(modules + 'grunt-contrib-connect/tasks/');
    grunt.loadTasks(modules + 'grunt-contrib-watch/tasks/');
    grunt.loadTasks(modules + 'grunt-concurrent/tasks/');
    grunt.loadTasks(modules + 'grunt-typescript/tasks/');

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

            if (cog.getOption('compile_typescript')) {
                concurrent.connect.tasks.push('server::compile');
            }

            grunt.config.set('concurrent', concurrent);
            grunt.task.run('concurrent');

            return;
        }

        // This server watches for changes and server autoreload requests.
        if (what === 'autoreload') {

            var files = ff.flatten(ff.indexFiles().concat(ff.mediaFiles()).concat(ff.includeJsFiles()).concat(ff.includeCssFiles())
                .concat(ff.includeUnitTestJsFiles()).concat(ff.unitTestDataFiles()).concat(ff.dataFiles()));
            if(!cog.getOption('template')) {
                files = files.concat(ff.flatten(ff.htmlTemplateFiles()));
            }
            var watch = {
                all: {
                    files: files,
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

        // This server watches for changes on the source files that needs to be compiled.
        if (what === 'compile') {
            var options = {};

            if (grunt.file.exists('tsconfig.json')) {
                options = grunt.file.readJSON('tsconfig.json').compilerOptions || {};
            }
            options.watch = true;

            var typescript = {
                all: {
                    src: ff.flatten(ff.srcTypescriptFiles()),
                    options: options
                }
            };

            grunt.config.set('typescript', typescript);
            grunt.task.run('typescript');

            return;
        }

        // This server serves static files and JSON-data, if configured.
        if (what === 'files') {

            var connect = {
                server: {
                    options: {
                        protocol: 'http',
                        port: port,
                        keepalive: true,
                        livereload: port + 1,
                        middleware: function(connect, options, middlewares) {

                            var static = cog.getOption('static_files');
                            if (static) {
                                middlewares.unshift(serveStatic(static, {}));
                            }

                            middlewares.unshift(function(req, res, next) {
                                server.handle(req, res);
                                return next();
                            });

                            return middlewares;
                        }
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
