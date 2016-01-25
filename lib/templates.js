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
 * Template generator.
 * @module templates
 */
module.exports = function(grunt) {

    var fs = require('fs');

    var cache = {};

    /**
     * Perform variable substitutions in the template.
     *
     * @param str Content of the template as a string.
     * @param variables An object containing variable values.
     *
     * Note that templating does not support single quotes. It also removes line feeds.
     */
    function substitute(str, variables) {

        // Based on Simple JavaScript Templating by
        // John Resig - http://ejohn.org/blog/javascript-micro-templating/ - MIT Licensed
        if (!cache[str]) {
            // Figure out if we're getting a template, or if we need to
            // load the template - and be sure to cache the result.
            try {
                /*jshint -W054 */
                cache[str] =  new Function("obj",
                    "var p=[],print=function(){p.push.apply(p,arguments);};" +

                    // Introduce the data as local variables using with(){}
                    "with(obj){p.push('" +

                    // Convert the template into pure JavaScript
                    str.replace(/[\r\t\n]/g, " ")
                    .split("<%").join("\t")
                    .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                    .replace(/\t=(.*?)%>/g, "',$1,'")
                    .split("\t").join("');")
                    .split("%>").join("p.push('")
                    .split("\r").join("\\'") +
                    "');}return p.join('');");
                /*jshint +W054 */
            } catch(e) {
                grunt.fail.fatal("Failed to compile template:\n" + str);
            }
        }

        return cache[str](variables || {});
    }

    /**
     * Generate a file based on the template and source files.
     *
     * @param tmpl Path to the template file.
     * @param src An array of source files.
     * @param variables Initial variables as an object.
     * @return A string with template substitutions made.
     */
    function generate(tmpl, src, variables) {
        variables = variables || {};
        variables.FILES = {};
        for (var i = 0; i < src.length; i++) {
            var content = JSON.stringify(grunt.file.read(src[i]));
            variables.FILES[src[i]] = content;
        }
        var template = grunt.file.read(tmpl);
        return substitute(template, variables);
    }

    return {
        substitute: substitute,
        generate: generate,
    };
};
