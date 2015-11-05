/**
 * Configurable output wrapper to make testing easier.
 */
module.exports = function(grunt) {

    var fs = require('fs');

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
        info: function(message) {
            var args = Array.prototype.slice.call(arguments);
            var msg = args.join(' ') + "\n";

            write(msg);
        }
    }
}
