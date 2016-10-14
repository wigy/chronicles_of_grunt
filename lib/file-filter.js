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
    var cog = require('./cog.js')(grunt);
    var db = require('./db.js')(grunt);

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
                if (db.known[category] && specs in db.known[category]) {
                    var spec = db.known[category][specs];
                    spec.required = true;
                    ret = ret.concat(files(spec, category));
                // All strings containing non-alpha characters are direct file patterns.
                } else if (/[^a-zA-Z]/.test(specs) || fs.existsSync(specs)) {
                    src = grunt.file.expand(specs);
                    for (i=0; i < src.length; i++) {
                        if (!grunt.file.isDir(src[i])) {
                            ret.push({src: src[i], dst: src[i], drop: ''});
                        }
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
                    srcPrefix = cog.prefix(specs.src);
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
                    var dstPrefix = specs.dst === null ? srcPrefix : specs.dst;
                    if (dstPrefix.substr(0, 7) === 'CONFIG:') {
                        dstPrefix = cog.getConfig(dstPrefix.substr(7), 'lib');
                    }

                    // Drop source prefix.
                    dst = src[j].substr(srcPrefix.length);
                    // Drop explicit dropping.
                    if (dst.substr(0, drop.length) === drop) {
                        dst = dst.substr(drop.length);
                    }

                    // Add explicit destination.
                    file.dst = path.join(dstPrefix, dst);

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
     * Find all external library code files excluding map-files.
     */
    function extLibFiles() {
        return excludeFiles(files(cog.getConfig('external.lib'), 'lib'), /\.map$/);
    }

    /**
     * Find all external library map-files.
     */
    function extLibMapFiles() {
        return includeFiles(files(cog.getConfig('external.lib'), 'lib'), /\.map$/);
    }

    /**
     * Find all exyternal CSS files.
     */
     function extCssFiles() {
         return files(cog.getConfig('external.css'), 'css');
     }

    /**
     * Find all external font files.
     */
    function extFontFiles() {
        return files(cog.getConfig('external.fonts'), 'fonts');
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
        return files(cog.getConfig('index.app'), 'index');
    }

    /**
     * Find test index files.
     */
    function testIndexFiles() {
        return files(cog.getConfig('index.test'), 'index');
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
        return files(cog.getConfig('src.config'), 'config');
    }

    /**
     * Find all libraries.
     */
    function libFiles() {
        return removeDuplicates(files(cog.getConfig('src.libs'), 'code'), configFiles());
    }

    /**
     * Find all models.
     */
    function modelFiles() {
        return removeDuplicates(files(cog.getConfig('src.models'), 'models'), configFiles().concat(libFiles()));
    }

    /**
     * Find all data files (not models).
     */
    function dataFiles() {
        return removeDuplicates(files(cog.getConfig('src.data'), 'data'), configFiles().concat(libFiles()).concat(modelFiles()));
    }

    /**
     * Find all source code files (not data nor models).
     */
    function codeFiles() {
        return removeDuplicates(files(cog.getConfig('src.code'), 'code'), configFiles().concat(libFiles()).concat(modelFiles()).concat(dataFiles()).concat(extLibFiles()));
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
         return files(cog.getConfig('src.task'), 'other');
     }

     /**
      * Find other work files that are Javascript.
      */
     function otherJsFiles() {
         return files(cog.getConfig('src.otherjs'), 'other');
     }

     /**
      * Find other files that are not Javascript.
      */
     function otherNonJsFiles() {
         return removeDuplicates(files(cog.getConfig('src.other'), 'other'), srcFiles().concat(otherJsFiles().concat(appIndexFiles())));
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
        return removeDuplicates(files(cog.getConfig('src.css'), 'css'), extCssFiles());
    }

    /**
     * Find all graphics files.
     */
    function picFiles() {
        return files(cog.getConfig('media.pics'), 'pics');
    }

    /**
     * Find all graphics soruce files to be converted to actual pictures.
     */
    function picSrcFiles() {
        return files(cog.getConfig('media.src.pics.files'), 'pics');
    }

    /**
     * Find all audio files.
     */
    function soundFiles() {
        return files(cog.getConfig('media.sounds'), 'sounds');
    }

    /**
     * Find all audio source files to be converted to actual sounds.
     */
    function soundSrcFiles() {
        return files(cog.getConfig('media.src.sounds.files'), 'sounds');
    }

    /**
     * Find other media files that are not specified.
     */
    function otherMediaFiles() {
        return files(cog.getConfig('media.other'), 'other');
    }

    /**
     * Find all application media files.
     */
    function mediaFiles() {
        return picFiles().concat(soundFiles()).concat(otherMediaFiles());
    }

    /**
     * Find all code files needed to include in HTML index.
     */
    function includeJsFiles() {
        if (cog.getOption('include_only_external')) {
            return extLibFiles().concat(generatedJsFiles());
        }
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
        return prefixDest(cog.pathDist(), extFontFiles().concat(mediaFiles()));
    }

    /**
     * List of files that goes to the actual distribution as compressed library files.
     */
    function distLibFiles() {
        return prefixDest(cog.pathDist(), extLibFiles());
    }

    /**
     * Get the entry point file for the application in the distribution.
     */
    function distIndexFiles() {
        return prefixDest(cog.pathDist(), appIndexFiles());
    }

    /**
     * Get the name(s) of CSS-files in the distribution.
     */
    function distCssFiles() {
        return [{src: cog.pathDist() + cog.getConfig('name') + '.css', dst: cog.pathDist() + cog.getConfig('name') + '.min.css'}];
    }

    /**
     * Get the name(s) of actual compressed application source code files in the distribution.
     */
    function distJsFiles() {
        return [{src: cog.pathDist() + cog.getConfig('name') + '.js', dst: cog.pathDist() + cog.getConfig('name') + '.min.js'}];
    }

    /**
     * Find all unit-test spec-files.
     */
    function unitTestFiles() {
        return files(cog.getConfig('test.unit.tests'), 'test');
    }

    /**
     * Find all unit-test Javascript helper files.
     */
    function unitTestHelperFiles() {
        return files(cog.getConfig('test.unit.helpers'), 'test');
    }

    /**
     * Find all unit-test library files.
     */
    function unitTestLibraryFiles() {
        return files(cog.getConfig('test.unit.lib'), 'lib');
    }

    /**
     * Find all unit-test data files.
     */
    function unitTestDataFiles() {
        return files(cog.getConfig('test.unit.data'), 'test');
    }

    /**
     * Find all code files needed to include in HTML index for unit test.
     */
    function includeUnitTestJsFiles() {
        var libs = extLibFiles().concat(unitTestLibraryFiles()).concat(generatedJsFiles());
        if (cog.getOption('include_only_external')) {
            return libs;
        }
        return libs.concat(srcFiles()).concat(unitTestHelperFiles()).concat(unitTestFiles());
    }

    /**
     * Find all CSS files needed to include in HTML index for unit test.
     */
    function includeUnitTestCssFiles() {
        return files(cog.getConfig('test.unit.css'), 'css');
    }

    /**
     * Find all unit-testing releated work files.
     */
    function allUnitTestFiles() {
        return unitTestFiles().concat(unitTestDataFiles()).concat(unitTestHelperFiles());
    }

    /**
     * Find all test files.
     */
    function allTestFiles() {
        return allUnitTestFiles();
    }

    /**
     * Find all Javascript based work files.
     */
    function allJavascriptFiles() {
        return srcFiles().concat(otherJsFiles()).concat(unitTestFiles()).concat(unitTestHelperFiles()).concat(taskFiles()).concat(commonJsFiles());
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
        return files(cog.getConfig('ignore'), 'common');
    }

    /**
     * List of tools written as shell scripts.
     */
    function toolsShellFiles() {
        return files(cog.getConfig('src.shell'));
    }

    /**
     * List of Python source code files.
     */
    function pythonFiles() {
        return files(cog.getConfig('src.python'));
    }

    /**
     * List of HTML-template files.
     */
    function htmlTemplateFiles() {
        return files(cog.getConfig('src.templates'));
    }

    /**
     * Find all text based work files.
     */
    function workTextFiles() {
        return indexFiles().concat(srcFiles()).concat(allTestFiles()).concat(otherJsFiles()).concat(otherNonJsFiles()).concat(taskFiles()).concat(cssFiles())
            .concat(toolsShellFiles()).concat(commonJsFiles()).concat(htmlTemplateFiles()).concat(pythonFiles());
    }

    /**
     * Return all Python compilation result files.
     */
    function compiledPythonFiles() {
        return files(cog.getConfig('compiled.python'));
    }

    /**
     * List of all resulting files produced by compilation process.
     */
    function allCompiledFiles() {
        return compiledPythonFiles();
    }

    /**
     * List of files that are generated, but are not other media files.
     */
    function generatedJsFiles(what) {
        var ret = [];
        if ((!what || what === 'templates') && htmlTemplateFiles().length) {
            ret.push({src: null, dst: cog.pathTemplate()});
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
            'htmlTemplateFiles', 'generatedJsFiles', 'otherMediaFiles', 'unitTestHelperFiles',
            'pythonFiles', 'compiledPythonFiles'];

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

    return {
        // Utility functions.
        flatten: flatten,
        files: files,
        removeDuplicates: removeDuplicates,
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
        otherMediaFiles: otherMediaFiles,
        mediaFiles: mediaFiles,
        includeJsFiles: includeJsFiles,
        includeCssFiles: includeCssFiles,
        distUncompressedFiles: distUncompressedFiles,
        distLibFiles: distLibFiles,
        distIndexFiles: distIndexFiles,
        distCssFiles: distCssFiles,
        distJsFiles: distJsFiles,
        unitTestFiles: unitTestFiles,
        unitTestHelperFiles: unitTestHelperFiles,
        unitTestLibraryFiles: unitTestLibraryFiles,
        unitTestDataFiles: unitTestDataFiles,
        includeUnitTestJsFiles: includeUnitTestJsFiles,
        includeUnitTestCssFiles: includeUnitTestCssFiles,
        allUnitTestFiles: allUnitTestFiles,
        allTestFiles: allTestFiles,
        workTextFiles: workTextFiles,
        commonJsFiles: commonJsFiles,
        commonOtherFiles: commonOtherFiles,
        commonFiles: commonFiles,
        ignoredFiles: ignoredFiles,
        toolsShellFiles: toolsShellFiles,
        htmlTemplateFiles: htmlTemplateFiles,
        generatedJsFiles: generatedJsFiles,
        allJavascriptFiles: allJavascriptFiles,
        pythonFiles: pythonFiles,
        compiledPythonFiles: compiledPythonFiles,
    };
};
