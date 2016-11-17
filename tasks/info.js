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

    var pckg = grunt.file.readJSON('package.json');

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
        log.info("Project: " + cog.getConfig('name'));
        log.info("Title: " + cog.getConfig('title'));
        log.info("Version: " + pckg.version);
        dumpFiles('External Libraries', ff.extLibFiles);
        dumpFiles('External Library map files', ff.extLibMapFiles);
        dumpFiles('External CSS-files', ff.extCssFiles);
        dumpFiles('External Fonts', ff.extFontFiles);
        dumpFiles('Index files', ff.indexFiles);
        dumpFiles('Configuration and global utilities', ff.configFiles);
        dumpFiles('Library files', ff.libFiles);
        dumpFiles('Model files', ff.modelFiles);
        dumpFiles('Source data files', ff.srcDataFiles);
        dumpFiles('Code files', ff.codeFiles);
        dumpFiles('CSS-files', ff.cssFiles);
        dumpFiles('Data files', ff.dataFiles);
        dumpFiles('Picture source files', ff.picSrcFiles);
        dumpFiles('Sound source files', ff.soundSrcFiles);
        dumpFiles('Grunt task-files', ff.taskFiles);
        dumpFiles('Other Javascript-files', ff.otherJsFiles);
        dumpFiles('Other non-Javascript-files', ff.otherNonJsFiles);
        dumpFiles('Unit test libraries', ff.unitTestLibraryFiles);
        dumpFiles('Unit test CSS-files', ff.includeUnitTestCssFiles);
        dumpFiles('Unit tests', ff.unitTestFiles);
        dumpFiles('Tools (shell script)', ff.toolsShellFiles);
    }

    grunt.registerTask('info', 'Display summary of the configured files and locations.', taskInfo);
};
