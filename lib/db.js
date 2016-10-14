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
module.exports = function(grunt) {

    // List of categories each library contributes.
    var categories = {
        "neat-dump": ['lib'],
        coa: ['lib'],
        angular: ['lib'],
        jquery: ['lib'],
        bootstrap: ['lib', 'css', 'fonts'],
        nodeunit: ['lib'],
        'angular-mock': ['lib'],
        'angular-route': ['lib'],
        jasmine: ['lib', 'css'],
        ember: ['lib'],
    };

    // TODO: Clean up formatting.
    // Catalog of supported libraries.
    var known = {
        lib: {
            "neat-dump": {src: 'node_modules/neat-dump/neat-dump.min.js', dst: 'CONFIG:paths.libs', drop: 'node_modules/neat-dump'},
            coa: {src: 'node_modules/chronicles_of_angular/dist/coa.min.js', dst: 'CONFIG:paths.libs', drop: 'node_modules/chronicles_of_angular/dist', needs: ['angular', 'neat-dump']},
            jquery: {src: 'node_modules/jquery/dist/jquery.min.*', dst: 'CONFIG:paths.libs', drop: 'node_modules/jquery/dist'},
            bootstrap: {src: 'node_modules/bootstrap/dist/js/bootstrap.min.js', dst: 'CONFIG:paths.libs', drop: 'node_modules/bootstrap/dist/js'},
            angular: {src: 'node_modules/angular/angular.min.{js,js.map}', dst: 'CONFIG:paths.libs', drop: 'node_modules/angular/'},
            underscore: {src: 'node_modules/underscore/underscore-min.js', dst: 'CONFIG:paths.libs', drop: 'node_modules/underscore/'},
            mingo: {src: 'node_modules/mingo/mingo.min.js', dst: 'CONFIG:paths.libs', drop: 'node_modules/mingo/', needs: 'underscore'},
            jasmine: [
                {src: 'node_modules/jasmine-core/lib/jasmine-core/jasmine.js', dst: null, drop: ''},
                {src: 'node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js', dst: null, drop: ''},
                {src: 'node_modules/jasmine-core/lib/jasmine-core/boot.js', dst: null, drop: ''},
            ],
            'angular-mock': {src: 'node_modules/angular-mocks/angular-mocks.js', dst: null, drop: '', needs: ['angular']},
            'angular-route': {src: 'node_modules/angular-route/angular-route.min.js', dst: 'CONFIG:paths.libs', drop: 'node_modules/angular-route/', needs: ['angular']},
            nodeunit: [],
            ember: [],
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
                {src: 'ember-cli-build.js', dst: null},
                {src: 'testem.js', dst: null},
            ],
            other: [
                {src: 'LICENSE', dst: null},
                {src: 'README.md', dst: null},
                {src: 'bin/grunt', dst: null},
                {src: 'package.json', dst: null},
                {src: 'bower.json', dst: null},
            ],
        }
    };

    // Framework specific options.
    var frameworks = {
        options: {
            ember: {
                include_only_external: true,
                test_include_only_external: true,
                include_drop : 'public/',
                include_prefix : '/',
            }
        }
    };

    return {
        known: known,
        categories: categories,
        frameworks: frameworks
    };
};