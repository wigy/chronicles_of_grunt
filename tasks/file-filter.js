module.exports = function(grunt) {

    // Known library file specifications.
    var known = {
        lib: {
            coa: {src: 'node_modules/chronicles_of_angular/lib/**', dst: 'lib/chronicles_of_angular', drop: 'node_modules/chronicles_of_angular/lib'},
            jquery: {src: 'node_modules/jquery/dist/jquery.min.*', dst: 'lib', drop: 'node_modules/jquery/dist'},
            bootstrap: {src: 'node_modules/bootstrap/dist/js/bootstrap.min.js', dst: 'lib', drop: 'node_modules/bootstrap/dist/js'},
            angular: {src: 'node_modules/angular/angular.min.{js,js.map}', dst: 'lib', drop: 'node_modules/angular/'},
        },
        css: {
            bootstrap: {src: 'node_modules/bootstrap/dist/css/bootstrap.min.css', dst: 'css', drop: 'node_modules/bootstrap/dist/css/'},
        },
        fonts: {
            bootstrap: {src: 'node_modules/bootstrap/dist/fonts/*', dst: 'fonts', drop: 'node_modules/bootstrap/dist/fonts/'},
        },
    };

    // Configuration.
    var config = grunt.config.get('build') || {options: {}};

    /**
	 * Safe fetch of configuration variable.
	 */
	function getConfig(name, def) {
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
                if (/[^a-zA-Z]/.test(specs)) {
                    src = grunt.file.expand(specs);
                    for (i=0; i < src.length; i++) {
                        ret.push({src: src[i], dst: src[i], drop: ''});
                    }
                } else if (known[category] && specs in known[category]) {
                    ret = ret.concat(files(known[category][specs], category));
                } else {
                    grunt.fail.fatal("Unknown build file specification '" + specs +"' for '" + category + "'.");
                }
            } else if (specs instanceof Array) {
                for (i = 0; i < specs.length; i++) {
                    ret = ret.concat(files(specs[i], category));
                }
            } else if (typeof(specs) === 'object') {
                // Here we expand pattens from 'src' and combine them with 'dst'.
                src = grunt.file.expand(specs.src);
                for (j=0; j < src.length; j++) {
                    var drop = specs.drop;
                    if (!drop) {
                        drop = specs.src;
                        while (drop.indexOf('*') >= 0) {
                            drop = path.dirname(drop);
                        }
                    }
                    file = {};
                    file.src = src[j];
                    if (grunt.file.isDir(file.src)) {
                        continue;
                    }
                    dst = src[j];
                    if (dst.substr(0, drop.length) === drop) {
                        dst = src[j].substr(drop.length);
                    }
                    file.dst = path.join(work_dir, specs.dst || category, dst);
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
     * Find all external library code files.
     */
    function extLibFiles() {
        return files(getConfig('external.lib'), 'lib');
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
     * Find all external files.
     */
    function extFiles() {
        return removeDuplicates(extLibFiles().concat(extCssFiles()).concat(extFontFiles()));
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
     * Find all source code files.
     */
     function srcFiles() {
         return removeDuplicates(configFiles().concat(modelFiles()).concat(dataFiles()).concat(codeFiles()));
     }

     /**
      * Find other work files.
      */
     function otherFiles() {
         return files(getConfig('src.other'), 'other');
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
        return excludeFiles(extLibFiles(), /\.map$/).concat(srcFiles());
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
     * Find all unit-test files.
     */
    function unitTestFiles() {
        return files(getConfig('test.unit'), 'test');
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

    return {
        flatten: flatten,
        getConfig: getConfig,

        extLibFiles: extLibFiles,
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
        otherFiles: otherFiles,
        cssFiles: cssFiles,
        picFiles: picFiles,
        soundFiles: soundFiles,
        includeJsFiles: includeJsFiles,
        includeCssFiles: includeCssFiles,
        distFilesUncompressed: distFilesUncompressed,
        unitTestFiles: unitTestFiles,
        testFiles: testFiles,
        workTextFiles: workTextFiles,
        workFiles: workFiles
    };
};
