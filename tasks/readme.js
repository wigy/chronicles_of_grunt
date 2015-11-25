module.exports = function(grunt) {

    // Load Node-modules.
    var fs = require('fs');

    /**
     * A class to wrap README-data.
     */
    function Readme(data) {
        this.next_version = data.next_version;
        this.release_history = data.release_history;
    }
    Readme.prototype = {};

    /**
     * Update data by copying done entries to the new released version.
     */
    Readme.prototype.release = function(version) {

        this.release_history.splice(0,0, {version: version, changes: this.next_version.done})
        this.next_version.done = [];
    }

    /**
     * Construct README-string for Release History section.
     */
    Readme.prototype.getHistory = function() {
        var ret = "## Release History\n\n";
        for (var i=0; i < this.release_history.length; i++) {
            ret += '* ' + this.release_history[i].version + '\n';
            for (var j = 0; j < this.release_history[i].changes.length; j++) {
            ret += '    - ' + this.release_history[i].changes[j] + '\n';
            }
        }
        return ret;
    };

    /**
     * Parse README.md file of the project.
     *
     * @param path {string} Path to the file to parse (defaults to README.md).
     * @return {object} A structrure presenting README.md content of interest.
     *
     * The object `obj` will have a list of lines (without bullet) that has been implemented in
     * `obj.next_version.done` and list of lines that has not yet been implemented in
     * `obj.next_version.not_yet_done`. In addition, `obj.release_history` will contain a list
     * of versions in a format [{version: '1.2.3', changes: ['change 1', 'change 2']}, ...]
     */
    function parse(path) {
        // TODO: Move to class.
        var ret = {'next_version': {'done': [], 'not_yet_done': []}, 'release_history': []};
        if (!path) {
            path = 'README.md';
        }
        var line, lines = grunt.file.read(path).split("\n");
        var title = null, subtitle = null, subsubtitle = null;
        for (var i = 0; i < lines.length; i++) {
            if (/^##\s+/.test(lines[i])) {
                title = lines[i].substr(3).trim().toLowerCase().replace(/ /g, '_');
                subtitle = null;
                subsubtitle = null;
            } else if (/^###\s+/.test(lines[i])) {
                subtitle = lines[i].substr(4).trim().toLowerCase().replace(/ /g, '_');
                subsubtitle = null;
            } else if (title === 'next_version' && (subtitle === 'done' || subtitle === 'not_yet_done')) {
                line = lines[i].replace(/^\s*[-*]\s+/, '').trim();
                if (line === '') {
                    continue;
                }
                ret[title][subtitle].push(line);
            } else if (title === 'release_history') {
                line = lines[i].trim();
                if (/^[-*]\s+v?[.0-9]+$/.test(line)) {
                    subsubtitle = line.substr(2).trim();
                } else if (subsubtitle) {
                    line = line.replace(/^\s*[-*]\s+/, '').trim();
                    if (line === '') {
                        continue;
                    }
                    if (ret.release_history.length === 0 ||
                        ret.release_history[ret.release_history.length - 1].version !== subsubtitle) {
                        ret.release_history.push({version: subsubtitle, changes: []});
                    }
                    ret.release_history[ret.release_history.length - 1].changes.push(line);
                }
            }
        }
        return new Readme(ret);
    }

    return {
        parse: parse
    };

};