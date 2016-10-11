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

    var pckg = grunt.file.readJSON('package.json');

    var cog = require('../lib/cog.js')(grunt);
    var ff = require('../lib/file-filter.js')(grunt);
    var log = require('../lib/log.js')(grunt);

    function taskVersion(version) {
        if (arguments.length === 0) {
            log.info("");
            log.info("Current version is", pckg.version);
            log.info("");
            log.info("You can make official release by giving new version number like 'x.y.z' or");
            log.info("you can start next release candidate by add postfix 'x.y.z-beta'.");
            log.info("To set new version, you run command: 'grunt version:x.y.z'");
        } else {
            if (!version.match(/^\d+\.\d+\.\d+(-beta)?$/)) {
                grunt.fail.fatal("Invalid version '" + version + "'.");
            }
            // Update package.
            var debugMode = (version.substr(version.length-4) === 'beta');
            pckg.version = version;
            grunt.file.write('package.json', JSON.stringify(pckg, null, 2));
            log.info("Set version", pckg.version, "to package.json.");

            // Update other files.
            var files = ff.flatten(ff.configFiles());
            for (var i=0; i<files.length; i++) {
                var file = files[i];
                var newSettings, settings = grunt.file.read(file);
                newSettings = settings.replace(/^VERSION\s*=\s*'.*'/gm, "VERSION = '" + pckg.version + "'");
                if (newSettings !== settings) {
                    log.info("Updated version", pckg.version, "to", file);
                    settings = newSettings;
                }
                newSettings = settings.replace(/^DEBUG\s*=\s[^;]*/gm, "DEBUG = " + debugMode.toString());
                if (newSettings !== settings) {
                    log.info("Set the debug mode to", debugMode, "in", file);
                }
                grunt.file.write(file, newSettings);
            }
        }
    }

    grunt.registerTask('version', 'Query or mark the version to the source files.', taskVersion);
};
