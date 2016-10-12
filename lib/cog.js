
var REQUIRED_MAJOR = 5;

module.exports = function(grunt) {

    var major = parseInt(process.versions.node.split('.')[0]);

    if (major < REQUIRED_MAJOR) {
        grunt.fail.fatal("Running CoG requires version " + REQUIRED_MAJOR + " of NodeJS (current " + process.versions.node + ").");
    }

    return {
    };
};