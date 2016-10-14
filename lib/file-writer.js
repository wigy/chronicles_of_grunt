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

/**
 * File lookup tools.
 * @module file-filter
 */
module.exports = function(grunt) {

    // Load Node-modules.
    var path = require('path');
    var fs = require('fs');
    var glob = require('glob');
    var ff = require('../lib/file-filter.js')(grunt);
    var cog = require('../lib/cog.js')(grunt);

    /**
     * Refresh HTML-file to use the given Javascript and CSS files.
     *
     * @param dst {string} Target path to the HTML-file.
     * @param jsFiles {Array} New list of Javascript-files to include.
     * @param cssFiles {Array} New list of CSS-files to include.
     */
    function writeIndex(dst, jsFiles, cssFiles) {

        var i;
        var file;
        var tag = "<!-- Added by CoG -->";

        // Construct javascript includes.
        var js = "";
        var drop = cog.getOption('include_drop');
        var prefix = cog.getOption('include_prefix');
        for (i=0; i < jsFiles.length; i++) {
            file = jsFiles[i];
            if (drop && file.substr(0, drop.length) === drop) {
                file = file.substr(drop.length);
            }
            if (prefix) {
                file = prefix + file;
            }
            js += '    <script src="' + file + '"></script>' + tag + '\n';
        }

        // Construct CSS includes.
        var css = "";
        for (i=0; i < cssFiles.length; i++) {
            css += '    <link rel="stylesheet" href="' + cssFiles[i] + '">' + tag + '\n';
        }

        // Insert inclusions to the index filr.
        var content = "";
        file = grunt.file.read(dst).trim();
        var lines = file.split("\n");
        var added = false;
        for (j=0; j < lines.length; j++) {
            if (/^\s*<script src=".*"><\/script><!-- Added by CoG -->$/.test(lines[j])) {
                // Drop javascript source file.
                continue;
            } else if (/^\s*<link rel="stylesheet" href=".*"><!-- Added by CoG -->$/.test(lines[j])) {
                // Drop CSS file.
                continue;
            } else if (/^\s*<\/head>\s*$/.test(lines[j])) {
                // Add the latest file lists.
                added = true;
                content += js;
                content += css;
                content += "  </head>\n";
                continue;
            } else {
                content += lines[j] + "\n";
            }
        }
        if (!added) {
            grunt.fail.fatal("Cannot find </head> from index file: " + dst);
        }
        grunt.file.write(dst, content);
    }

    return {
        writeIndex: writeIndex,
    };
};
