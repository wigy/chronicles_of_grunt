/*
 * Chronicles of Grunt
 *
 * (C) 2016 Tommi Ronkainen
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

    var cog = require('../lib/cog.js')(grunt);
    var ff = require('../lib/file-filter.js')(grunt);
    var fw = require('../lib/file-writer.js')(grunt);
    var log = require('../lib/log.js')(grunt);

    var modules = cog.prefix();

    grunt.loadTasks(modules + 'grunt-contrib-cssmin/tasks/');
    grunt.loadTasks(modules + 'grunt-contrib-uglify/tasks/');
    grunt.loadTasks(modules + 'grunt-contrib-concat/tasks/');
    grunt.loadTasks(modules + 'grunt-contrib-clean/tasks/');

    function taskCleanup() {

        var settings = {
            all: [cog.pathDist() + cog.getConfig('name') + '.js'] // Uncompressed version of the distribution file.
        };

        grunt.config.set('clean', settings);
        grunt.task.run('clean');
    }

    function taskDist(args) {

        var debug = false;
        var i, dist, settings;
        var pckg = grunt.file.readJSON('package.json');

        if (args) {
            if (args === 'debug') {
                debug = true;
            } else {
                grunt.fail.fatal("Invalid arguments for dist-task.");
            }
        }

        log.info("");

        var matches = ff.distUncompressedFiles();
        if (matches.length) {
            log.info("");
            log.info("Copying media files...");
            log.info("");
            for (i = 0; i < matches.length; i++) {
                log.info(matches[i].src + ' -> ' + matches[i].dst);
                grunt.file.copy(matches[i].src, matches[i].dst);
            }
        }

        // Copy libraries.
        var compressedJsFiles = [];
        var libs = ff.distLibFiles();
        if (libs.length) {
            log.info("");
            log.info("Copying libraries...");
            log.info("");
            for (i = 0; i < libs.length; i++) {
                log.info(libs[i].src + ' -> ' + libs[i].dst);
                grunt.file.copy(libs[i].src, libs[i].dst);
                compressedJsFiles.push(libs[i].dst.replace(cog.pathDist(), ''));
            }
        }

        // Collect CSS.
        var cssFiles = ff.includeCssFiles();
        var compressedCssFiles = [];
        if (cssFiles.length) {
            log.info("");
            log.info("Compressing CSS...");
            log.info("");
            settings = {all: {files: {}}};
            dist = ff.distCssFiles()[0];
            compressedCssFiles.push(dist.dst.replace(cog.pathDist(), ''));
            settings.all.files[dist.dst] = ff.flatten(cssFiles);
            grunt.config.set('cssmin', settings);
            grunt.task.run('cssmin');
        }

        // Compress code.
        var jsFiles = ff.srcFiles().concat(ff.generatedJsFiles());
        if (jsFiles.length) {
            log.info("");
            log.info("Collecting Javascript...");
            log.info("");

            dist = ff.distJsFiles()[0];

            settings = {all: {}};
            settings.all.src = ff.flatten(jsFiles);
            settings.all.dest = dist.src;
            grunt.config.set('concat', settings);
            grunt.task.run('concat');

            log.info("");
            log.info("Compressing Javascript...");
            log.info("");
            var banner = '';
            banner += '/* ' + cog.getConfig('title', pckg.name) + ' v' + pckg.version + '\n';
            banner += ' * Copyright (c) ' + grunt.template.today("yyyy") + (pckg.author ? ' ' + pckg.author.name : '') + '\n';
            banner += ' */\n';

            compressedJsFiles.push(dist.dst.replace(cog.pathDist(), ''));

            if (!debug) {
                settings = {options: {banner: banner}, dist: {}};
                settings.dist.src = dist.src;
                settings.dist.dest = dist.dst;
                grunt.config.set('uglify', settings);
                grunt.task.run('uglify');
                grunt.task.run('cleanup');
            }
        }

        // Build index file(s).
        var indices = ff.distIndexFiles();
        if (indices.length) {
            log.info("");
            log.info("Building index...");
            log.info("");
            for (i = 0; i < indices.length; i++) {
                log.info(indices[i].src + ' -> ' + indices[i].dst);
                grunt.file.copy(indices[i].src, indices[i].dst);
                fw.writeIndex(indices[i].dst, compressedJsFiles, compressedCssFiles);
            }
        }
    }

    grunt.registerTask('dist', 'Collect and minify all application files into the dist-directory.', taskDist);
    grunt.registerTask('cleanup', 'Remove unnecessary files.', taskCleanup);
};
