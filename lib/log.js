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
 * Configurable output wrapper.
 * @module log
 */
module.exports = function(grunt) {

    var fs = require('fs');

        /**
         * @ngdoc service
         * @name coa.input.kissa
         * @description
         * Write one or more messages either to the grunt log or to the file.
         * If the configuration variable <code>build.options.log_file</code>
         * defines a path, then that file is used. Otherwise the messages are
         * written to the <i>Grunt</i>-log.
         * @example
         * &lt;a href="kljlj">
         */
    function write(msg) {

        var log = grunt.config.get('build.options.log_file');

        if (!log) {
            grunt.log.ok(msg);
        } else {
            var out = fs.openSync(log, 'a');
            fs.writeSync(out, msg);
            fs.closeSync(out);
        }
    }

    return {

        /**
         * Write one or more messages either to the grunt log or to the file.
         * If the configuration variable <code>build.options.log_file</code>
         * defines a path, then that file is used. Otherwise the messages are
         * written to the <i>Grunt</i>-log.
         *
         * @param arg1 {any} First message.
         * @param argN {any} Last message.
         */
        info: function(arg1, arg2, argN) {
            var args = Array.prototype.slice.call(arguments);
            var msg = args.join(' ') + "\n";

            write(msg);
        }
    };
};
