
var child_process = require('child_process');

// Storage for the output lines of the latest run.
var output = [];
// Parsed version of the ouput.
var parsed = {};

module.exports = {

    /**
     * Run a grunt task and return output.
     */
    run: function(task) {
        output = [];
        parsed = {};
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
    },

    /**
     * Parse source lines and form object based on the text interpreted as sub titles.
     * If a line ends with (:) then it is considered as a subtitle and will collect lines
     * under it under that name in the result object. If colon is in the middle, then left
     * side is taken as the name and the right side as a value.
     *
     * If `subtitle` is given, then the parsed content of that section is returned.
     */
    parse: function(subtitle) {

        if (subtitle) {
            var ret = module.exports.parse();
            return ret[subtitle];
        }

        if (Object.keys(parsed).length) {
            return parsed;
        }

        var subtitle;
        for (var i = 0; i < output.length; i++) {
            if (output[i] === 'Done, without errors.') {
                break;
            }
            var match = /^(.+?):(.+)$/.exec(output[i].trim());
            if (match) {
                parsed[match[1].trim()] = match[2].trim();
                continue;
            }
            if (output[i].substr(-1,1) == ':') {
                subtitle = output[i].substr(0, output[i].length - 1).trim();
                continue;
            }
            if (subtitle) {
                var str = output[i].trim();
                if (str === '') {
                    continue;
                }
                parsed[subtitle] = parsed[subtitle] || [];
                parsed[subtitle].push(str);
                parsed[subtitle] = parsed[subtitle].sort();
            }
        }

        return parsed;
    }
    // TODO: Add regex based lookup and return all macthed expressions as an array (or single match as is).
};
