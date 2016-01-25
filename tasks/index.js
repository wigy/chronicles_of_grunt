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

    var ff = require('../lib/file-filter.js')(grunt);
    var log = require('../lib/log.js')(grunt);

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

    grunt.registerTask('index', 'Scan all configured javascript and css files and update html-files using them.', taskIndex);
};
