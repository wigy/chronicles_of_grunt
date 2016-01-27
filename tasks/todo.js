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

    var colors = require('colors');

    var ff = require('../lib/file-filter.js')(grunt);
    var log = require('../lib/log.js')(grunt);
    var readme = require('../lib/readme.js')(grunt);

    function taskTodo(die) {

        var i,j;
        var count = 0;
        var files = ff.flatten(ff.workTextFiles());
        var TODO = "TODO" + ":";

        for (i=0; i<files.length; i++) {
            var seen = false;
            var lines = grunt.file.read(files[i]).split("\n");
            for (j=0; j<lines.length; j++) {
                if( lines[j].indexOf(TODO) >= 0) {
                    count++;
                    if (!seen) {
                        seen = true;
                        log.info("");
                        log.info(files[i]["blue"]);
                        log.info("");
                    }
                    log.info(("  Line " + (j+1) + "")["green"], lines[j].trim());
                }
            }
        }

        var parsed = readme.parse();
        if (parsed.next_version.not_yet_done.length) {
            log.info("");
            log.info(("README.md")["blue"]);
            log.info("");
            for (i=0; i<parsed.next_version.not_yet_done.length; i++) {
                log.info("  Not Yet Done "["green"], parsed.next_version.not_yet_done[i]);
                count++;
            }
        }

        log.info("");
        log.info(("TODO-entries open: " + count)["magenta"]);
        log.info("");
        if (count && die === 'die') {
            grunt.fail.fatal("There are unfinished TODO-entries that needs to be resolved.\n" +
                                "Please cancel or implement them or gather them to the future version plan.");
        }
    }

    grunt.registerTask('todo', 'Scan for remaining TODO-entries from the source code and display them.', taskTodo);
};
