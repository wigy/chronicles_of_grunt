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

    grunt.loadTasks(modules + 'grunt-jsdoc/tasks/');
    grunt.loadTasks(modules + 'grunt-ngdocs/tasks/');

    function taskDocs() {

        var src = ff.flatten(ff.allSrcFiles());
        var engine = cog.getConfig('docs.engine') || 'jsdoc';
        var dst = cog.pathDocs();
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
                        title: cog.getConfig('title') || cog.getConfig('name')
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

    grunt.registerTask('docs', 'Build all documentation.', taskDocs);
};
