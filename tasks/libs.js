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

    function taskLibs() {
        log.info("");
        var matches = ff.extFiles();
        for (var i = 0; i < matches.length; i++) {
            log.info(matches[i].src + ' -> ' + matches[i].dst);
            grunt.file.copy(matches[i].src, matches[i].dst);
        }
    }

    grunt.registerTask('libs', 'Update fresh copies of libraries from installed node-modules.', taskLibs);
};
