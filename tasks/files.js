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
            log.info((count + " file(s) unknown.")['red']);
            if (die === 'die') {
                grunt.fail.fatal("There are files in the repository that are not known.\n" +
                                 "Please add them to the appropriate categories in Gruntfile.js.\n" +
                                 "If there are no category for them, then just add them to the 'ignore' category.");
            }
        } else {
            if (die !== 'show') {
                log.info("All files known!"['green']);
            }
        }
    }

    grunt.registerTask('files', 'Analyse and list all unknown files in the repository.', taskFiles);
};
