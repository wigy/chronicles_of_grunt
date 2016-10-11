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

    var colors = require('colors');
    var cog = require('../lib/cog.js')(grunt);
    var log = require('../lib/log.js')(grunt);
    var readme = require('../lib/readme.js')(grunt);

    function taskPreRelease() {
        // Check that we are in development mode.
        if (/^[.0-9]+$/.test(pckg.version)) {
            grunt.fail.fatal("Cannot make release from this version.\nMust have a non-release version like 1.1.0-beta as the current version.");
        }
        // Check that something has been done.
        var parsed = readme.parse();
        if (parsed.next_version.done.length === 0) {
            grunt.fail.fatal("There are not any entries in 'Done' section of 'Next Version'.");
        }

        log.info("Looking good.");
        log.info("Running standard release checks next.");
    }

    function taskRelease(skipped) {
        var args = Array.prototype.slice.call(arguments);
        var tasks = ['prerelease'];
        if (args.indexOf('verify') < 0) {
            tasks.push('verify');
        }
        if (args.indexOf('todo') < 0) {
            tasks.push('todo:die');
        }
        if (args.indexOf('files') < 0) {
            tasks.push('files:die');
        }
        if (args.indexOf('test') < 0) {
            tasks.push('test');
        }
        if (args.indexOf('build') < 0) {
            tasks.push('build');
        }
        if (args.indexOf('docs') < 0) {
            tasks.push('docs');
        }

        var postskip = '';
        if (args.indexOf('dist') >= 0) {
            postskip += ':dist';
        }
        tasks.push('postrelease' + postskip);
        grunt.task.run(tasks);
    }

    function taskPostRelease(skipped) {

        var args = Array.prototype.slice.call(arguments);

        // Calculate new version and print out summary.
        var parsed = readme.parse();
        var version = pckg.version.replace(/[^0-9.]+$/, '');
        log.info("All checks passed!");
        log.info("Ready for the release:");
        log.info("");
        log.info("  Version: " + version["cyan"]);
        log.info("  Changes:");
        for (var i=0; i < parsed.next_version.done.length; i++) {
            log.info("  * " + parsed.next_version.done[i]["cyan"]);
        }
        log.info("");
        log.info("Once commited and tagged, you can start next iteration by assigning new development version");
        log.info("and making plans by collecting goals for the next version into README.md. Also remember run");
        log.info("npm publish"["red"] + " after commiting, if this is published as a npm-package.");
        log.info("");
        // Re-calculate versioning data and write it back.
        parsed.release(version);
        parsed.write();
        grunt.task.run('version:' + version);
        if (args.indexOf('dist') < 0) {
            grunt.task.run('dist');
        }
    }

    grunt.registerTask('prerelease', 'Pre-checks for the relase.', taskPreRelease);
    grunt.registerTask('postrelease', 'File updating after relase.', taskPostRelease);
    grunt.registerTask('release', 'Make all sanity checks and if passed, create next release version.', taskRelease);
};
