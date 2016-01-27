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
    var modules = ff.prefix();

    grunt.loadTasks(modules + 'grunt-contrib-jasmine/tasks/');
    grunt.loadTasks(modules + 'grunt-contrib-nodeunit/tasks/');

    function taskTest(which) {

        var settings;

        // Select test runner.
        var type = ff.configuredUnitTesting();
        if (!type) {
            grunt.fail.fatal("Testing system is not configured. Please set test.unit.external to the ['jasmine'] or ['nodeunit'].");
        }

        // Collect files for test.
        var src = ff.flatten(ff.srcFiles());
        var specs = ff.flatten(ff.unitTestFiles());
        var libs = ff.flatten(ff.extLibFiles());

        // Add all other than Jasmine-libs to vendor list.
        libs = libs.concat(ff.flatten(ff.removeDuplicates(ff.unitTestLibraryFiles(), ff.files(['jasmine'], 'lib'))));

        // Select defined tests.
        var args = Array.prototype.slice.call(arguments);
        if (args.length) {
            var selected = [];
            for (var i = 0; i < args.length; i++) {
                for (var j = 0; j < specs.length; j++) {
                    if (specs[j].indexOf(args[i]) >= 0) {
                        selected.push(specs[j]);
                    }
                }
            }

            if (!selected.length) {
                grunt.fail.fatal("No tests match to the given arguments.");
            }
            specs = selected;
        }

        // Run Jasmine.
        if (type === 'jasmine') {
            settings = {
                all: {
                    src: src,
                    options: {
                        specs: specs,
                        vendor: libs
                    },
                }
            };
            grunt.config.set('jasmine', settings);
            grunt.task.run('jasmine');
        }

        // Run nodeunit.
        else if (type === 'nodeunit') {
            settings = {
                all: specs,
                options: {}
            };
            grunt.config.set('nodeunit', settings);
            grunt.task.run('nodeunit');
        }
    }

    grunt.registerTask('test', 'Run all tests or tests containing argument substring in their filename.', taskTest);
};
