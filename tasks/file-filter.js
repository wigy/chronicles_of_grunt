/**
 * File lookup tools.
 * @module file-filter
 */
module.exports = function(grunt) {

    // Load Node-modules.
    var path = require('path');
    var fs = require('fs');

    // Known library file specifications.
    var known = {
        lib: {
            coa: {src: 'node_modules/chronicles_of_angular/dist/coa.min.js', dst: 'lib', drop: 'node_modules/chronicles_of_angular/dist'},
            jquery: {src: 'node_modules/jquery/dist/jquery.min.*', dst: 'lib', drop: 'node_modules/jquery/dist'},
            bootstrap: {src: 'node_modules/bootstrap/dist/js/bootstrap.min.js', dst: 'lib', drop: 'node_modules/bootstrap/dist/js'},
            angular: {src: 'node_modules/angular/angular.min.{js,js.map}', dst: 'lib', drop: 'node_modules/angular/'},
            jasmine: [
                {src: 'node_modules/grunt-contrib-jasmine/node_modules/jasmine-core/lib/jasmine-core/jasmine.js', dst: null, drop: ''},
                {src: 'node_modules/grunt-contrib-jasmine/node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js', dst: null, drop: ''},
                {src: 'node_modules/grunt-contrib-jasmine/node_modules/jasmine-core/lib/jasmine-core/boot.js', dst: null, drop: ''},
            ],
            nodeunit: [],
            'angular-mock': [
                {src: 'node_modules/angular-mocks/angular-mocks.js', dst: null, drop: ''},
            ],
        },
        css: {
            bootstrap: {src: 'node_modules/bootstrap/dist/css/bootstrap.min.css', dst: 'css', drop: 'node_modules/bootstrap/dist/css/'},
            jasmine: [
                {src: 'node_modules/grunt-contrib-jasmine/node_modules/jasmine-core/lib/jasmine-core/jasmine.css', dst: null},
            ],
        },
        fonts: {
            bootstrap: {src: 'node_modules/bootstrap/dist/fonts/*', dst: 'fonts', drop: 'node_modules/bootstrap/dist/fonts/'},
        },
    };

    /**
     * Find the path prefix to the node_modules containing needed utilities.
     */
    function prefix(pattern) {
        if (!pattern) {
            pattern = 'grunt-available-tasks';
        }
        pattern = pattern.replace(/^node_modules\//, '');
        var ret;
        if (grunt.file.expand('node_modules/' + pattern).length) {
            ret = 'node_modules/';
        } else if (grunt.file.expand('../../node_modules/' + pattern).length) {
            ret = '../../node_modules/';
        } else if (grunt.file.expand('node_modules/chronicles_of_grunt/node_modules/' + pattern).length) {
            ret = 'node_modules/chronicles_of_grunt/node_modules/';
        } else {
            grunt.fail.fatal("Cannot find module path for " + pattern);
        }
        return ret;
    }

    /**
	 * Safe fetch of configuration variable.
	 */
	function getConfig(name, def) {

        var config = grunt.config.get('build') || {options: {}};
        var ret = config.options;

        if (!name) {
            return ret;
        }
        var parts = name.split('.');
        for (var i=0; i < parts.length; i++) {
            if (!ret) {
                return def;
            }
            ret = ret[parts[i]];
        }

        return ret || def;
    }

    /**
     * Collect list of source file patterns and expand them to single files.
     */
    function files(specs, category) {
        var ret = [];
        var src, dst, file;
        var i, j;

        if (specs) {
            if (typeof(specs) === 'string') {
                // Handle known file collections.
                if (known[category] && specs in known[category]) {
                    var spec = known[category][specs];
                    spec.required = true;
                   ret = ret.concat(files(spec, category));
                // All strings containing non-alpha characters are direct file patterns.
                } else if (/[^a-zA-Z]/.test(specs)) {
                    src = grunt.file.expand(specs);
                    for (i=0; i < src.length; i++) {
                        ret.push({src: src[i], dst: src[i], drop: ''});
                    }
                } else {
                    grunt.fail.fatal("Unknown build file specification '" + specs +"' for '" + category + "'.");
                }
            } else if (specs instanceof Array) {
                // Handle array of specs one by one.
                for (i = 0; i < specs.length; i++) {
                    ret = ret.concat(files(specs[i], category));
                }
            } else if (typeof(specs) === 'object') {

                // Calculate path prefix for file sources.
                var srcPrefix = '';
                if (specs.src.substr(0,12) === 'node_modules') {
                    srcPrefix = prefix(specs.src);
                    if (srcPrefix.substr(-13) === 'node_modules/') {
                        srcPrefix = srcPrefix.substr(0, srcPrefix.length - 13);
                    }
                }

                // Here we expand pattens from 'src' and combine them with 'dst'.
                src = grunt.file.expand(srcPrefix + specs.src);

                // Check required files.
                if (src.length === 0 && specs.required) {
                    grunt.fail.fatal("Cannot find required files '" + specs.src + "'.");
                }

                // Calculate resulting specifications.
                for (j=0; j < src.length; j++) {
                    var drop = specs.drop;
                    if (!drop && drop !=='') {
                        // If dst is null, then we keep the file where it is originally.
                        if (specs.dst === null) {
                            drop = '';
                        } else {
                            // Otherwise look for the last directory not having wild-cards.
                            drop = specs.src;
                            while (drop.indexOf('*') >= 0) {
                                drop = path.dirname(drop);
                            }
                        }
                    }
                    // Construct final file description.
                    file = {};
                    // Use source path as is and we can skip directories.
                    file.src = src[j];
                    if (grunt.file.isDir(file.src)) {
                        continue;
                    }
                    // Destination path is calculated.
                    // Drop source prefix.
                    dst = src[j].substr(srcPrefix.length);
                    // Drop explicit dropping.
                    if (dst.substr(0, drop.length) === drop) {
                        dst = dst.substr(drop.length);
                    }
                    // Add also explicit destination.
                    file.dst = path.join(specs.dst === null ? srcPrefix : specs.dst, dst);
                    ret.push(file);
                }
            }
        }
        return ret;
    }

    /**
     * Scan file specs and remove duplicates.
     *
     * @param files {Array} List of resolved file specs.
     * @param duplicates {Array} Optional list of resolved file specs to consider duplicates.
     */
    function removeDuplicates(files, duplicates) {
        var i;
        var ret = [];
        var found = {};

        if (duplicates) {
            for (i=0; i < duplicates.length; i++) {
                found[duplicates[i].dst] = true;
            }
        }

        for (i=0; i < files.length; i++) {
            if (!found[files[i].dst]) {
                found[files[i].dst] = true;
                ret.push(files[i]);
            }
        }
        return ret;
    }

    /**
     * Collect destination files from file spec list.
     */
    function flatten(files) {
        var ret = [];
        for (var i=0; i < files.length; i++) {
            ret.push(files[i].dst);
        }
        return ret;
    }

    /**
     * Remove specs whose destination matches to the given regex pattern.
     */
    function excludeFiles(list, regex) {
        var ret = [];
        for (var i=0; i < list.length; i++) {
            if (!regex.test(list[i].dst)) {
                ret.push(list[i]);
            }
        }
        return ret;
    }

    /**
     * Only include specs whose destination matches to the given regex pattern.
     */
    function includeFiles(list, regex) {
        var ret = [];
        for (var i=0; i < list.length; i++) {
            if (regex.test(list[i].dst)) {
                ret.push(list[i]);
            }
        }
        return ret;
    }

    /**
     * Find all external library code files excluding map-files.
     */
    function extLibFiles() {
        return excludeFiles(files(getConfig('external.lib'), 'lib'), /\.map$/);
    }

    /**
     * Find all external library map-files.
     */
    function extLibMapFiles() {
        return includeFiles(files(getConfig('external.lib'), 'lib'), /\.map$/);
    }

    /**
     * Find all exyternal CSS files.
     */
     function extCssFiles() {
         return files(getConfig('external.css'), 'css');
     }

    /**
     * Find all external font files.
     */
    function extFontFiles() {
        return files(getConfig('external.fonts'), 'fonts');
    }

    /**
     * Find all external files including map-files.
     */
    function extFiles() {
        return removeDuplicates(extLibFiles().concat(extLibMapFiles()).concat(extCssFiles()).concat(extFontFiles()));
    }

    /**
     * Find application index files.
     */
    function appIndexFiles() {
        return files(getConfig('index.app'), 'index');
    }

    /**
     * Find test index files.
     */
    function testIndexFiles() {
        return files(getConfig('index.test'), 'index');
    }

    /**
     * Find test index files.
     */
    function indexFiles() {
        return appIndexFiles().concat(testIndexFiles());
    }

    /**
     * Find all configuration files.
     */
    function configFiles() {
        return files(getConfig('src.config'), 'config');
    }

    /**
     * Find all models.
     */
    function modelFiles() {
        return removeDuplicates(files(getConfig('src.models'), 'models'), configFiles());
    }

    /**
     * Find all data files (not models).
     */
    function dataFiles() {
        return removeDuplicates(files(getConfig('src.data'), 'data'), configFiles().concat(modelFiles()));
    }

    /**
     * Find all source code files (not data nor models).
     */
    function codeFiles() {
        return removeDuplicates(files(getConfig('src.code'), 'code'), configFiles().concat(modelFiles()).concat(dataFiles()));
    }

    /**
     * Find all source code files for the actual application.
     */
     function srcFiles() {
         return removeDuplicates(configFiles().concat(modelFiles()).concat(dataFiles()).concat(codeFiles()));
     }

     /**
      * Find other work files that are Javascript.
      */
     function otherFiles() {
         return files(getConfig('src.other'), 'other');
     }

    /**
     * Find all source code files needed for API-doc generation.
     */
     function allSrcFiles() {
         return srcFiles().concat(otherFiles());
     }

    /**
     * Find all CSS files.
     */
    function cssFiles() {
        return removeDuplicates(files(getConfig('src.css'), 'css'), extCssFiles());
    }

    /**
     * Find all graphics files.
     */
    function picFiles() {
        return files(getConfig('src.pics'), 'pics');
    }

    /**
     * Find all audio files.
     */
    function soundFiles() {
        return files(getConfig('src.sounds'), 'sounds');
    }

    /**
     * Find all code files needed to include in HTML index.
     */
    function includeJsFiles() {
        return extLibFiles().concat(srcFiles());
    }

    /**
     * Find all CSS files needed to include in HTML index.
     */
    function includeCssFiles() {
        return extCssFiles().concat(cssFiles());
    }

    /**
     * List of files that goes to the actual distribution unmodified.
     */
    function distFilesUncompressed() {
        return extFontFiles().concat(picFiles()).concat(soundFiles());
    }

    /**
     * Find all unit-test spec-files.
     */
    function unitTestFiles() {
        return files(getConfig('test.unit'), 'test');
    }

    /**
     * Find all unit-test library files.
     */
    function unitTestLibraryFiles() {
        return files(getConfig('external.unittestlib'), 'lib');
    }

    /**
     * Find all code files needed to include in HTML index for unit test.
     */
    function includeUnitTestJsFiles() {
        return extLibFiles().concat(unitTestLibraryFiles()).concat(srcFiles()).concat(unitTestFiles());
    }

    /**
     * Find all CSS files needed to include in HTML index for unit test.
     */
    function includeUnitTestCssFiles() {
        return files(getConfig('external.unittestcss'), 'css');
    }

    /**
     * Find all test files.
     */
    function testFiles() {
        return unitTestFiles();
    }

    /**
     * Find all text based work files.
     */
    function workTextFiles() {

        return indexFiles().concat(srcFiles()).concat(testFiles()).concat(otherFiles()).concat(cssFiles());
    }

    /**
     * Find all work files.
     */
    function workFiles() {

        return workTextFiles().concat(picFiles()).concat(soundFiles());
    }

    /**
     * Refresh HTML-file to use the given Javascript and CSS files.
     *
     * @param dst {string} Target path to the HTML-file.
     * @param jsFiles {Array} New list of Javascript-files to include.
     * @param cssFiles {Array} New list of CSS-files to include.
     */
    function writeIndex(dst, jsFiles, cssFiles) {

        var i;

        // Construct javascript includes.
        var js = "";
        for (i=0; i < jsFiles.length; i++) {
            js += '    <script src="' + jsFiles[i] + '"></script>\n';
        }

        // Construct CSS includes.
        var css = "";
        for (i=0; i < cssFiles.length; i++) {
            css += '    <link rel="stylesheet" href="' + cssFiles[i] + '">\n';
        }

        // Insert inclusions to the index filr.
        var content = "";
        var file = grunt.file.read(dst).trim();
        var lines = file.split("\n");
        var added = false;
        for (j=0; j < lines.length; j++) {
            if (/^\s*<script src=".*"><\/script>$/.test(lines[j])) {
                // Drop javascript source file.
                continue;
            } else if (/^\s*<link rel="stylesheet" href=".*">$/.test(lines[j])) {
                // Drop CSS file.
                continue;
            } else if (/^\s*<\/head>\s*$/.test(lines[j])) {
                // Add the latest file lists.
                added = true;
                content += js;
                content += css;
                content += "  </head>\n";
                continue;
            } else {
                content += lines[j] + "\n";
            }
        }
        if (!added) {
            grunt.fail.fatal("Cannot find </head> from index file: " + dst);
        }
        grunt.file.write(dst, content);
    }

    return {
        flatten: flatten,
        getConfig: getConfig,
        prefix: prefix,
        files: files,
        removeDuplicates: removeDuplicates,
        writeIndex: writeIndex,

        extLibFiles: extLibFiles,
        extLibMapFiles: extLibMapFiles,
        extCssFiles: extCssFiles,
        extFontFiles: extFontFiles,
        extFiles: extFiles,
        appIndexFiles: appIndexFiles,
        testIndexFiles: testIndexFiles,
        indexFiles: indexFiles,
        configFiles: configFiles,
        modelFiles: modelFiles,
        dataFiles: dataFiles,
        codeFiles: codeFiles,
        srcFiles: srcFiles,
        allSrcFiles: allSrcFiles,
        otherFiles: otherFiles,
        cssFiles: cssFiles,
        picFiles: picFiles,
        soundFiles: soundFiles,
        includeJsFiles: includeJsFiles,
        includeCssFiles: includeCssFiles,
        distFilesUncompressed: distFilesUncompressed,
        unitTestFiles: unitTestFiles,
        unitTestLibraryFiles: unitTestLibraryFiles,
        includeUnitTestJsFiles: includeUnitTestJsFiles,
        includeUnitTestCssFiles: includeUnitTestCssFiles,
        testFiles: testFiles,
        workTextFiles: workTextFiles,
        workFiles: workFiles
    };
};
