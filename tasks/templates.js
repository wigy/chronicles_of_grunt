/**
 * Template generator.
 * @module templates
 */
module.exports = function(grunt) {

    var fs = require('fs');

    return {

        /**
         * Generate a file based on the template and source files.
         */
        generate: function(tmpl, src, dst) {
            // TODO: Hmm. Why here?
            src = src[0]
            console.log(src)
            // TODO: More sophisticated templating language needed (now this is Angular-specific.)
            var variables = {FILES: {}, OUTPUT: ''};
            for (var i = 0; i < src.length; i++) {
                var content = grunt.file.read(src[i]);
                console.log(JSON.stringify(content));
                // TODO: Construct OUTPUT.
                // TODO: Substitute.
            }
        }
    };
};
