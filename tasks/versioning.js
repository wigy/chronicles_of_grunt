/*
 * (C) 2015 Tommi Ronkainen
 *
 * Licenced under GPL-2.
 */

module.exports = function(grunt) {
    grunt.registerTask('versioning', 'Query and mark the version to the source files.', function(version) {

        var options = this.options({file: null});
        var pkg = grunt.file.readJSON('package.json');

        if (arguments.length === 0) {
            grunt.log.ok("");
            grunt.log.ok("Current version is", pkg.version);
            grunt.log.ok("");
            grunt.log.ok("You can make official release by giving new version number like 'x.y.z' or");
            grunt.log.ok("you can start next release candidate by add postfix 'x.y.z-beta'.");
            grunt.log.ok("To set new version, you run command: 'grunt versioning:x.y.z'");
        } else {
            if (!version.match(/^\d+\.\d+\.\d+(-beta)?$/)) {
                grunt.fail.fatal("Invalid version '" + version + "'.");
            }
            var debugMode = (version.substr(version.length-4) === 'beta');
            pkg.version = version;
            grunt.file.write('package.json', JSON.stringify(pkg, null, 2));
            grunt.log.ok("Updated version", pkg.version, "to package.json.");
            if (options.file) {
                var settings = grunt.file.read(options.file);
                settings = settings.replace(/^VERSION\s*=\s*'.*'/gm, "VERSION = '" + pkg.version + "'");
                settings = settings.replace(/^DEBUG\s*=\s[^;]*/gm, "DEBUG = " + debugMode.toString());
                grunt.file.write(options.file, settings);
                grunt.log.ok("Updated version", pkg.version, "to", options.file);
                grunt.log.ok("Set the debug mode to", debugMode, "in", options.file);
            }
        }
    });
};
