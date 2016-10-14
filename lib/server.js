/*
 * Chronicles of Grunt
 *
 * (C) 2015 Tommi Ronkainen
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

    var ff = require('./file-filter.js')(grunt);
    var cog = require('./cog.js')(grunt);

    /**
     * This is the development server used by CoG.
     */
    function handler(req, res) {

        var path = cog.getConfig('options.api_data');
        var urlRegex = cog.getConfig('options.api_url_regex');
        var url = req.url.replace(/^\//, '').replace(/\/$/, '');

        // Find the JSON-data file and serve it, if URL points to the API.
        if (path && urlRegex && urlRegex.test(url)) {
            var file = path + '/' + url + '.json';
            if (grunt.file.exists(file)) {
                res.end(grunt.file.read(file));
                return;
            }
        }

    }

    return {
        handle: handler
    };
};

