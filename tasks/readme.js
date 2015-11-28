/**
 *  Utilities to parse and manipulate README.md file.
 *
 *  @module readme
 */
module.exports = function(grunt) {

    // Load Node-modules.
    var fs = require('fs');

    /**
     * A class to wrap README-data.
     *
     * @class Readme
     */
    function Readme() {
        this.next_version = {'done': [], 'not_yet_done': []};
        this.release_history = [];
    }
    Readme.prototype = {};

    /**
     * Update data by copying done entries to the new released version.
     * @param version {String} New version to be set.
     */
    Readme.prototype.release = function(version) {

        this.release_history.splice(0,0, {version: 'v' + version, changes: this.next_version.done});
        this.next_version.done = [];
    };

    /**
     * Construct a string for <i>Release History</i> section.
     * @return {String} A <i>Release History</i> section as a string.
     */
    Readme.prototype.getHistory = function() {

        var ret = "## Release History\n\n";
        for (var i=0; i < this.release_history.length; i++) {
            ret += '* ' + this.release_history[i].version + '\n';
            for (var j = 0; j < this.release_history[i].changes.length; j++) {
            ret += '    - ' + this.release_history[i].changes[j] + '\n';
            }
        }
        ret += '\n';

        return ret;
    };

    /**
     * Construct a string for `Next Version` section.
     *
     * @return {String} A <i>Next Version</i> section as a string.
     */
    Readme.prototype.getNextVersion = function() {

        var i;
        var ret = "## Next Version\n\n";

        ret += "### Done\n\n";
        for (i=0; i < this.next_version.done.length; i++) {
            ret += '* ' + this.next_version.done[i] + '\n';
        }
        if (i) {
            ret += '\n';
        }

        ret += "### Not Yet Done\n\n";
        for (i=0; i < this.next_version.not_yet_done.length; i++) {
            ret += '* ' + this.next_version.not_yet_done[i] + '\n';
        }
        if (i) {
            ret += '\n';
        }

        return ret;
    };

    /**
     * Parse README.md file of the project.
     *
     * This object will have a list of lines (without bullet) that has been implemented in
     * <code>this.next_version.done</code> and list of lines that has not yet been implemented in
     * <code>this.next_version.not_yet_done</code>. In addition, <code>this.release_history</code> will contain a list
     * of versions in a format <code>[{version: '1.2.3', changes: ['change 1', 'change 2']}, ...]</code>.
     *
     * @param path {string} Path of the file to parse (defaults to README.md).
     */
    Readme.prototype.parse = function(path) {
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
                this[title][subtitle].push(line);
            } else if (title === 'release_history') {
                line = lines[i].trim();
                if (/^[-*]\s+v?[.0-9]+$/.test(line)) {
                    subsubtitle = line.substr(2).trim();
                    if (subsubtitle[0] !== 'v') {
                        subsubtitle = 'v' + subsubtitle;
                    }
                } else if (subsubtitle) {
                    line = line.replace(/^\s*[-*]\s+/, '').trim();
                    if (line === '') {
                        continue;
                    }
                    if (this.release_history.length === 0 ||
                        this.release_history[this.release_history.length - 1].version !== subsubtitle) {
                        this.release_history.push({version: subsubtitle, changes: []});
                    }
                    this.release_history[this.release_history.length - 1].changes.push(line);
                }
            }
        }
    };

    /**
     * Write the file from the current data by overriding standard sections.
     *
     * @param path {string} Path to the file to write (defaults to README.md).
     */
    Readme.prototype.write = function(path) {
        if (!path) {
            path = 'README.md';
        }
        var line, title = null, clip = false, lines = grunt.file.read(path).split("\n");
        var result = '';
        for (var i = 0; i < lines.length; i++) {
            if (/^##\s+/.test(lines[i])) {
                title = lines[i].substr(3).trim();
                clip = false;
                if (title === 'Next Version') {
                    clip = true;
                    result += this.getNextVersion();
                } else if (title === 'Release History') {
                    clip = true;
                    result += this.getHistory();
                }
            }
            if (!clip) {
                result += lines[i] + '\n';
            }
        }
        grunt.file.write(path, result.trim());
    };

    return {
        parse: function(path) {

            var ret = new Readme();
            ret.parse(path);
            return ret;
        }
    };
};