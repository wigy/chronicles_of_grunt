/*
 * Chronicles of Grunt
 *
 * (C) 2015 Tommi Ronkainen
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

/**
 * File lookup tools.
 * @module file-filter
 */
module.exports = function(grunt) {

    // Load Node-modules.
    var path = require('path');
    var fs = require('fs');
    var glob = require('glob');

    // Known library file specifications.
    var known = {
        lib: {
            "neat-dump": {src: 'node_modules/neat-dump/neat-dump.min.js', dst: 'lib', drop: 'node_modules/neat-dump'},
            coa: {src: 'node_modules/chronicles_of_angular/dist/coa.min.js', dst: 'lib', drop: 'node_modules/chronicles_of_angular/dist', needs: ['angular', 'neat-dump']},
            jquery: {src: 'node_modules/jquery/dist/jquery.min.*', dst: 'lib', drop: 'node_modules/jquery/dist'},
            bootstrap: {src: 'node_modules/bootstrap/dist/js/bootstrap.min.js', dst: 'lib', drop: 'node_modules/bootstrap/dist/js'},
            angular: {src: 'node_modules/angular/angular.min.{js,js.map}', dst: 'lib', drop: 'node_modules/angular/'},
            underscore: {src: 'node_modules/underscore/underscore-min.js', dst: 'lib', drop: 'node_modules/underscore/'},
            mingo: {src: 'node_modules/mingo/mingo.min.js', dst: 'lib', drop: 'node_modules/mingo/', needs: 'underscore'},
            jasmine: [
                {src: 'node_modules/jasmine-core/lib/jasmine-core/jasmine.js', dst: null, drop: ''},
                {src: 'node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js', dst: null, drop: ''},
                {src: 'node_modules/jasmine-core/lib/jasmine-core/boot.js', dst: null, drop: ''},
            ],
            nodeunit: [],
            'angular-mock': {src: 'node_modules/angular-mocks/angular-mocks.js', dst: null, drop: ''},
        },
        css: {
            bootstrap: {src: 'node_modules/bootstrap/dist/css/bootstrap.min.css', dst: 'css', drop: 'node_modules/bootstrap/dist/css/'},
            jasmine: {src: 'node_modules/jasmine-core/lib/jasmine-core/jasmine.css', dst: null},
        },
        fonts: {
            bootstrap: {src: 'node_modules/bootstrap/dist/fonts/*', dst: 'fonts', drop: 'node_modules/bootstrap/dist/fonts/'},
        },
        common: {
            js: [
                {src: 'Gruntfile.js', dst: null},
            ],
            other: [
                {src: 'LICENSE', dst: null},
                {src: 'README.md', dst: null},
                {src: 'bin/grunt', dst: null},
                {src: 'package.json', dst: null},
            ],
        }
    };

    // List of categories each library contributes.
    var categories = {
        "neat-dump": ['lib'],
        coa: ['lib'],
        angular: ['lib'],
        jquery: ['lib'],
        bootstrap: ['lib', 'css', 'fonts'],
        nodeunit: ['lib'],
        'angular-mock': ['lib'],
        jasmine: ['lib', 'css'],
    };

    // Currently loaded configuration.
    var config;

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
     * Find the path to the root of the CoG.
     */
    function root() {
        if (getConfig('cog_development')) {
            return prefix().replace('node_modules/', '');
        }
        return prefix() + 'chronicles_of_grunt/';
    }

    /**
     * Safe fetch of configuration variable.
     */
    function getConfig(name, def) {

        var i, j;

        // Load initital config.
        if (!config) {

            var external;

            config = grunt.config.get('cog') || {options: {}};

            // Expand general external definitions to category specific definitions.
            if (config.options.external instanceof Array) {
                external = config.options.external;
                config.options.external = {lib: [], css: [], fonts: []};
                for (i=0; i < external.length; i++) {
                    if (!categories[external[i]]) {
                        grunt.fail.fatal("Cannot figure out applicaple categories for external dependency: " + external[i]);
                    }
                    for(j = 0; j < categories[external[i]].length; j++) {
                        config.options.external[categories[external[i]][j]].push(external[i]);
                    }
                }
            }

            // Expand also for unit tests.
            if (config.options.test && config.options.test.unit && config.options.test.unit.external instanceof Array) {
                external = config.options.test.unit.external;
                config.options.test.unit.lib = [];
                config.options.test.unit.css = [];
                for (i=0; i < external.length; i++) {
                    for(j = 0; j < categories[external[i]].length; j++) {
                        config.options.test.unit[categories[external[i]][j]].push(external[i]);
                    }
                }
            }
        }

        var ret = config.options;

        if (!name) {
            return ret;
        }

        var parts = name.split('.');
        for (i=0; i < parts.length; i++) {
            if (!ret) {
                return def;
            }
            ret = ret[parts[i]];
        }

        return ret || def;
    }

    /**
     * Check the selected libraries for testing system.
     */
    function configuredUnitTesting() {
        var lib = getConfig('test.unit.lib');
        if (!lib) {
            return null;
        }
        if (lib === 'jasmine' || lib.indexOf('jasmine') >= 0) {
            return 'jasmine';
        }
        if (lib === 'nodeunit' || lib.indexOf('nodeunit') >= 0) {
            return 'nodeunit';
        }
        return null;
    }

    /**
     * Collect list of source file specifications and expand them to single files.
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
                } else if (/[^a-zA-Z]/.test(specs) || fs.existsSync(specs)) {
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

                // Collect dependencies.
                if (specs.needs) {
                    ret = files(specs.needs, category);
                }

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

        // Drop duplicates.
        var seen = {};
        var results = [];
        for(i=0; i < ret.length; i++) {
            var name = ret[i].src + ' => ' + ret[i].dst;
            if (seen[name]) {
                continue;
            }
            seen[name] = true;
            results.push(ret[i]);
        }
        return results;
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
     * Add a directory prefix to all destinations in the file list.
     */
    function prefixDest(prefix, files) {
        for (var i = 0; i < files.length; i++) {
            files[i].dst = prefix + files[i].dst;
        }
        return files;
    }

    /**
     * Perform recursive lookup for files in the repository.
     *
     * @return {Array} A list of files in the repository ignoring files of not interest.
     *
     * Currently <tt>node_modules</tt> and <tt>doc</tt> directories are ignored on the top level.
     * Additionally any file ending with <tt>~</tt> is ignored.
     */
    function filesInRepository(dir) {
        var ignoreDirs = ['node_modules', 'doc'];
        var ignoreFiles = /~$/;
        var files = glob.sync(dir ? dir + '/*' : '*');
        var ret = [];
        for (var i = 0; i < files.length; i++) {
            if (fs.lstatSync(files[i]).isDirectory()) {
                // Ignore standard directories of uninterest.
                if (!dir && ignoreDirs.indexOf(files[i]) >= 0) {
                    continue;
                }
                ret = filesInRepository(files[i]).concat(ret);
            } else {
                if (!ignoreFiles.test(files[i])) {
                    ret.push(files[i]);
                }
            }
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
     * Find all libraries.
     */
    function libFiles() {
        return removeDuplicates(files(getConfig('src.libs'), 'code'), configFiles());
    }

    /**
     * Find all models.
     */
    function modelFiles() {
        return removeDuplicates(files(getConfig('src.models'), 'models'), configFiles().concat(libFiles()));
    }

    /**
     * Find all data files (not models).
     */
    function dataFiles() {
        return removeDuplicates(files(getConfig('src.data'), 'data'), configFiles().concat(libFiles()).concat(modelFiles()));
    }

    /**
     * Find all source code files (not data nor models).
     */
    function codeFiles() {
        return removeDuplicates(files(getConfig('src.code'), 'code'), configFiles().concat(libFiles()).concat(modelFiles()).concat(dataFiles()));
    }

    /**
     * Find all source code files for the actual application.
     */
     function srcFiles() {
         return removeDuplicates(configFiles().concat(libFiles()).concat(modelFiles()).concat(dataFiles()).concat(codeFiles()));
     }

     /**
      * Find Javascript-files defining additional tasks for Grunt.
      */
     function taskFiles() {
         return files(getConfig('src.task'), 'other');
     }

     /**
      * Find other work files that are Javascript.
      */
     function otherJsFiles() {
         return files(getConfig('src.otherjs'), 'other');
     }

     /**
      * Find other files that are not Javascript.
      */
     function otherNonJsFiles() {
         return files(getConfig('src.other'), 'other');
     }

    /**
     * Find all source code files needed for API-doc generation or syntax checking.
     */
     function allSrcFiles() {
         return srcFiles().concat(otherJsFiles()).concat(commonJsFiles()).concat(taskFiles());
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
        return files(getConfig('media.pics'), 'pics');
    }

    /**
     * Find all graphics soruce files to be converted to actual pictures.
     */
    function picSrcFiles() {
        return files(getConfig('media.src.pics.files'), 'pics');
    }

    /**
     * Find all audio files.
     */
    function soundFiles() {
        return files(getConfig('media.sounds'), 'sounds');
    }

    /**
     * Find all audio source files to be converted to actual sounds.
     */
    function soundSrcFiles() {
        return files(getConfig('media.src.sounds.files'), 'sounds');
    }

    /**
     * Find all application media files.
     */
    function mediaFiles() {
        return picFiles().concat(soundFiles());
    }

    /**
     * Find all code files needed to include in HTML index.
     */
    function includeJsFiles() {
        return extLibFiles().concat(srcFiles()).concat(generatedJsFiles());
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
    function distUncompressedFiles() {
        return prefixDest(pathDist(), extFontFiles().concat(mediaFiles()));
    }

    /**
     * List of files that goes to the actual distribution as compressed library files.
     */
    function distLibFiles() {
        return prefixDest(pathDist(), extLibFiles());
    }

    /**
     * Get the entry point file for the application in the distribution.
     */
    function distIndexFiles() {
        return prefixDest(pathDist(), appIndexFiles());
    }

    /**
     * Get the name(s) of CSS-files in the distribution.
     */
    function distCssFiles() {
        return [{src: pathDist() + getConfig('name') + '.css', dst: pathDist() + getConfig('name') + '.min.css'}];
    }

    /**
     * Get the name(s) of actual compressed application source code files in the distribution.
     */
    function distJsFiles() {
        return [{src: pathDist() + getConfig('name') + '.js', dst: pathDist() + getConfig('name') + '.min.js'}];
    }

    /**
     * Find all unit-test spec-files.
     */
    function unitTestFiles() {
        return files(getConfig('test.unit.tests'), 'test');
    }

    /**
     * Find all unit-test library files.
     */
    function unitTestLibraryFiles() {
        return files(getConfig('test.unit.lib'), 'lib');
    }

    /**
     * Find all unit-test data files.
     */
    function unitTestDataFiles() {
        return files(getConfig('test.unit.data'), 'test');
    }

    /**
     * Find all code files needed to include in HTML index for unit test.
     */
    function includeUnitTestJsFiles() {
        return extLibFiles().concat(unitTestLibraryFiles()).concat(srcFiles()).concat(generatedJsFiles()).concat(unitTestFiles());
    }

    /**
     * Find all CSS files needed to include in HTML index for unit test.
     */
    function includeUnitTestCssFiles() {
        return files(getConfig('test.unit.css'), 'css');
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
        return indexFiles().concat(srcFiles()).concat(testFiles()).concat(otherJsFiles()).concat(otherNonJsFiles()).concat(taskFiles()).concat(cssFiles())
            .concat(toolsShellFiles()).concat(commonJsFiles()).concat(htmlTemplateFiles());
    }

    /**
     * List of common Javascript-files.
     */
    function commonJsFiles() {
        return files('js', 'common');
    }

    /**
     * List of other common files.
     */
    function commonOtherFiles() {
        return files('other', 'common');
    }

    /**
     * List of all common files.
     */
    function commonFiles() {
        return commonJsFiles().concat(commonOtherFiles());
    }

    /**
     * List of files to be ignored.
     */
    function ignoredFiles() {
        return files(getConfig('ignore'), 'common');
    }

    /**
     * List of tools written as shell scripts.
     */
    function toolsShellFiles() {
        return files(getConfig('src.shell'));
    }

    /**
     * List of HTML-template files.
     */
    function htmlTemplateFiles() {
        return files(getConfig('src.templates'));
    }

    /**
     * List of files that are generated, but are not other media files.
     */
    function generatedJsFiles(what) {
        var ret = [];
        if ((!what || what === 'templates') && htmlTemplateFiles().length) {
            ret.push({src: null, dst: pathTemplate()});
        }
        return ret;
    }

    /**
     * Build complete map of known files.
     *
     * Note that when adding new file categories, this function must be updated and all
     * new non-overlapping (i.e. atomic) categories needs to be added here.
     */
    function fileCategoryMap() {

        // Go over every file lookup function we export.
        var exports = module.exports(grunt);
        // This list of categories must contain all non-overlapping file categories.
        var categories = ['extLibFiles', 'extLibMapFiles', 'extCssFiles', 'extFontFiles',
            'appIndexFiles', 'testIndexFiles', 'configFiles', 'libFiles', 'modelFiles', 'dataFiles',
            'codeFiles', 'otherJsFiles', 'otherNonJsFiles', 'taskFiles', 'cssFiles', 'picFiles', 'soundFiles', 'unitTestFiles',
            'commonJsFiles', 'commonOtherFiles', 'ignoredFiles', 'distUncompressedFiles',
            'distLibFiles', 'distIndexFiles', 'distJsFiles', 'distCssFiles',
            'toolsShellFiles', 'unitTestDataFiles', 'picSrcFiles', 'soundSrcFiles',
            'htmlTemplateFiles', 'generatedJsFiles'];

        // Construct the map by calling each function defined above.
        var map = {};
        for (var i = 0; i < categories.length; i++) {
            var files = flatten(exports[categories[i]]());
            for (var j = 0; j < files.length; j++) {
                if (map[files[j]]) {
                    grunt.fail.warn("A file '" + files[j] + "' maps to category '" + categories[i] + "' in addition to '" + map[files[j]] + "' category.");
                } else {
                    map[files[j]] = categories[i];
                }
            }
        }
        return map;
    }

    /**
     * Get target path for building distribution.
     */
    function pathDist() {
        var ret = getConfig('paths.dist', 'dist/');
        if (! /\/$/.test(ret)) {
            ret += '/';
        }
        return ret;
    }

    /**
     * Get target path for building API docs.
     */
    function pathDocs() {
        var ret = getConfig('paths.docs', 'docs/');
        if (! /\/$/.test(ret)) {
            ret += '/';
        }
        return ret;
    }

    /**
     * Get target path for generated template.
     */
    function pathTemplate() {
        return getConfig('paths.template', 'generated-templates.js');
    }

    return {
        // Utility functions.
        configuredUnitTesting: configuredUnitTesting,
        flatten: flatten,
        getConfig: getConfig,
        prefix: prefix,
        root: root,
        files: files,
        removeDuplicates: removeDuplicates,
        writeIndex: writeIndex,
        filesInRepository: filesInRepository,
        fileCategoryMap: fileCategoryMap,
        // All file listing functions.
        extLibFiles: extLibFiles,
        extLibMapFiles: extLibMapFiles,
        extCssFiles: extCssFiles,
        extFontFiles: extFontFiles,
        extFiles: extFiles,
        appIndexFiles: appIndexFiles,
        testIndexFiles: testIndexFiles,
        indexFiles: indexFiles,
        configFiles: configFiles,
        libFiles: libFiles,
        modelFiles: modelFiles,
        dataFiles: dataFiles,
        codeFiles: codeFiles,
        srcFiles: srcFiles,
        allSrcFiles: allSrcFiles,
        taskFiles: taskFiles,
        otherJsFiles: otherJsFiles,
        otherNonJsFiles: otherNonJsFiles,
        cssFiles: cssFiles,
        picFiles: picFiles,
        picSrcFiles: picSrcFiles,
        soundFiles: soundFiles,
        soundSrcFiles: soundSrcFiles,
        mediaFiles: mediaFiles,
        includeJsFiles: includeJsFiles,
        includeCssFiles: includeCssFiles,
        distUncompressedFiles: distUncompressedFiles,
        distLibFiles: distLibFiles,
        distIndexFiles: distIndexFiles,
        distCssFiles: distCssFiles,
        distJsFiles: distJsFiles,
        unitTestFiles: unitTestFiles,
        unitTestLibraryFiles: unitTestLibraryFiles,
        unitTestDataFiles: unitTestDataFiles,
        includeUnitTestJsFiles: includeUnitTestJsFiles,
        includeUnitTestCssFiles: includeUnitTestCssFiles,
        testFiles: testFiles,
        workTextFiles: workTextFiles,
        commonJsFiles: commonJsFiles,
        commonOtherFiles: commonOtherFiles,
        commonFiles: commonFiles,
        ignoredFiles: ignoredFiles,
        toolsShellFiles: toolsShellFiles,
        htmlTemplateFiles: htmlTemplateFiles,
        generatedJsFiles: generatedJsFiles,
        pathDist: pathDist,
        pathDocs: pathDocs,
        pathTemplate: pathTemplate,
    };
};
