
var child_process = require('child_process');
var fs = require('fs');
var glob = require('glob');

// Storage for the output lines of the latest run.
var output = [];
// Parsed version of the ouput.
var parsed = {};
// Storage for saved files.
var saved = {};

module.exports = {

    /**
     * Run a grunt task and return output.
     */
    run: function(task) {
        output = [];
        parsed = {};
        var out = child_process.spawnSync('../../node_modules/grunt-cli/bin/grunt', [task], {cwd: 'test/workdir', stderr: true, failOnError: true});
        if (out.error) {
            console.log("\nTEST RUNNER FAILED: " + out.error.code + ": " + out.error.path + " " + out.error.spawnargs);
            return '';
        }
        if (out) {
            output = out.stdout.toString().split("\n");
            for (var i = 0; i < output.length; i++) {
                if (output[i].substr(0,3) === '>> ') {
                    output[i] = output[i].substr(3);
                }
            }
        }
        return output;
    },

    /**
     * Get the content of a file in the test directory.
     */
    read: function(filename) {
        return fs.readFileSync('test/workdir/' + filename).toString();
    },

    /**
     * Save the given file to the temporary storage.
     */
    save: function(filename) {
        saved[filename] = module.exports.read(filename);
    },

    /**
     * Delete a file from the workdir.
     */
    delete: function(filename) {
        if (fs.existsSync('test/workdir/' + filename)) {
            fs.unlinkSync('test/workdir/' + filename);
        }
    },

    /**
     * Remove all files and the directory recursively.
     */
    clean: function(dir) {
        if (!fs.existsSync(dir)) {
            return;
        }
        var files = glob.sync(dir + '/*');
        var drop = [];
        for (var i = 0; i < files.length; i++) {
            if (fs.lstatSync(files[i]).isDirectory()) {
                module.exports.clean(files[i]);
            } else {
                drop.push(files[i]);
            }
        }
        for (var j = 0; j < drop.length; j++) {
            fs.unlinkSync(drop[j]);
        }
        fs.rmdirSync(dir);
    },

    /**
     * Restore the content of the given file from the temporary storage and delete the copy.
     */
    restore: function(filename) {
        fs.writeFileSync('test/workdir/' + filename, saved[filename]);
        delete saved[filename];
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
     * Collect lines from the output matching the regex (if regex grouping used, give first group content).
     */
    grep: function(regex) {
        var ret = [];
        for (var i = 0; i < output.length; i++) {
            if (regex.test(output[i])) {
                var match = output[i].match(regex);
                ret.push(match[1] === undefined ? output[i] : match[1]);
            }
        }
        return ret;
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

        subtitle = '';
        for (var i = 0; i < output.length; i++) {
            if (output[i] === 'Done, without errors.') {
                break;
            }
            var match = /^(.+?):(.+)$/.exec(output[i].trim());
            if (match) {
                parsed[match[1].trim()] = match[2].trim();
                continue;
            }
            if (output[i].substr(-1,1) === ':') {
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
};
