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

var REQUIRED_MAJOR = 5;

/**
 * Common environment information.
 * @module cog
 */
module.exports = function(grunt) {

    // Check the version first.
    var major = parseInt(process.versions.node.split('.')[0]);

    if (major < REQUIRED_MAJOR) {
        grunt.fail.fatal("Running CoG requires version " + REQUIRED_MAJOR + " of NodeJS (current " + process.versions.node + ").");
    }

    // Load Node-modules.
    var db = require('./db.js')(grunt);

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
                    if (!db.categories[external[i]]) {
                        grunt.fail.fatal("Cannot figure out applicaple categories for external dependency: " + external[i]);
                    }
                    for(j = 0; j < db.categories[external[i]].length; j++) {
                        config.options.external[db.categories[external[i]][j]].push(external[i]);
                    }
                }
            }

            // Expand also for unit tests.
            if (config.options.test && config.options.test.unit && config.options.test.unit.external instanceof Array) {
                external = config.options.test.unit.external;
                config.options.test.unit.lib = [];
                config.options.test.unit.css = [];
                for (i=0; i < external.length; i++) {
                    for(j = 0; j < db.categories[external[i]].length; j++) {
                        config.options.test.unit[db.categories[external[i]][j]].push(external[i]);
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
     * Check the frameworks defined.
     */
    function configuredFramework() {
        var lib = getConfig('external.lib');
        if (!lib) {
            return null;
        }
        if (typeof(lib) === 'string') {
            lib = [lib];
        }
        if (lib.indexOf('ember') >= 0) {
            return 'ember';
        }
        if (lib.indexOf('angular') >= 0 || lib.indexOf('coa') >= 0) {
            return 'angular';
        }
        return null;
    }

    /**
     * Check the selected libraries for testing system.
     */
    function configuredUnitTesting() {
        var lib = getConfig('test.unit.external');

        if (!lib) {
            return null;
        }
        if (typeof(lib) === 'string') {
            lib = [lib];
        }
        if (lib.indexOf('jasmine') >= 0) {
            return 'jasmine';
        }
        if (lib.indexOf('nodeunit') >= 0) {
            return 'nodeunit';
        }
        return null;
    }


    /**
     * Get the value of a configuration flag.
     */
    function getOption(name) {
        var ret = getConfig('options.' + name);
        if (ret === undefined) {
            var framework = configuredFramework();
            if (db.frameworks.options[framework]) {
                ret = db.frameworks.options[framework][name];
            }
        }
        return ret;
    }

    // TODO: Use 'options' instead of separate 'paths' variable.
    /**
     * Get target path for building distribution.
     */
    function pathDist() {
        var ret = getConfig('options.dist', 'dist/');
        if (! /\/$/.test(ret)) {
            ret += '/';
        }
        return ret;
    }

    /**
     * Get target path for building API docs.
     */
    function pathDocs() {
        var ret = getConfig('options.docs', 'docs/');
        if (! /\/$/.test(ret)) {
            ret += '/';
        }
        return ret;
    }

    /**
     * Get target path for generated template.
     */
    function pathTemplate() {
        return getConfig('options.template', 'generated-templates.js');
    }

  return {
        configuredFramework: configuredFramework,
        configuredUnitTesting: configuredUnitTesting,
        getConfig: getConfig,
        getOption: getOption,
        prefix: prefix,
        root: root,
        pathDist: pathDist,
        pathDocs: pathDocs,
        pathTemplate: pathTemplate,
    };
};