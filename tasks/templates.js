/**
 * Template generator.
 * @module templates
 */
module.exports = function(grunt) {

    var fs = require('fs');


    /**
     * Perform variable substitutions in the template.
     *
     * @param tmpl Content of the template as a string.
     * @param variables An object containing variable values.
     */
    function substitute(tmpl, variables) {

        // TODO: More sophisticated templating language needed.

        for (var v in variables) {
            var re = new RegExp('\\{\\{' + v + '\\}\\}', 'g');
            tmpl = tmpl.replace(re, variables[v]);
        }
        return tmpl;
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
        // TODO: Hmm. Why here?
        src = src[0];
        variables.FILES = {};
        variables.OUTPUT = '';
        for (var i = 0; i < src.length; i++) {
            var content = JSON.stringify(grunt.file.read(src[i]));
            variables.FILES[src[i]] = content;
            // TODO: This belongs to the template itself, since it is Angular-specific.
            variables.OUTPUT += '$templateCache.put("' + src[i] + '",' + content + ');\n';
        }
        var template = grunt.file.read(tmpl);
        return substitute(template, variables);
    }

    return {
        substitute: substitute,
        generate: generate,
    };
};
