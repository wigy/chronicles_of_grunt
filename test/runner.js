
var child_process = require('child_process');

// Storage for the output lines of the latest run.
var output = [];

module.exports = {

    /**
     * Run a grunt task and return output.
     */
    run: function(task) {
        output = [];
        var out = child_process.spawnSync('../../node_modules/grunt-cli/bin/grunt', [task], {cwd: 'test/workdir', stderr: true, failOnError: true});
        if (out) {
            output = out.stdout.toString().split("\n");
            for (var i = 0; i < output.length; i++) {
                if (output[i].substr(0,3) === '>> ') {
                    output[i] = output[i].substr(3);
                }
            }
        }
        return out;
    },

    /**
     * Check if the output of the latest run contains the given line.
     */
    hasLine: function(line) {
        for (var i = 0; i < output.length; i++) {
            if (output[i] === line) {
                return true;
            }
        }
        return false;
    }
    // TODO: Add parsing based on : and use it with lists.
    // TODO: Add regex based lookup and return all macthed expressions as an array (or single match as is).
};
