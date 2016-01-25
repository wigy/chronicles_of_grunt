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
