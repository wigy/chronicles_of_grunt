# Wigy's Chronicles of Grunt

Wigy's collection of useful utilities for Grunt. The focus of these utilities
is to provide easy way to develop complete web-applications, that can be built
as an install packages. The development itself happens directly in the browser,
which loads entry point HTML-file of the application and works out of the box.
To achieve this, certain conventions needs to be followed and this toolkit
helps you to perform necessary steps in the development process.

## Getting Started

You may install this plugin with this command:
```shell
npm install chronicles_of_grunt --save-dev
```

## Configuration

The configuration has few settings defining project information and how to find
various files. Each source file specification can be either a file glob pattern as a string
or an array of those.

For example, here is a simple complete `Gruntfile.js`:
```js
module.exports = function(grunt) {

  grunt.initConfig({
    cog: {
      options: {
          name: "my_project",
          title: "My Project",
          external: ['jquery']
          src: {
              code: 'src/**/*.js',
              css: 'css/*.css'
          },
          media: {
              pics: ['pics/*.png' , 'pics/*.jpg']
          },
          index: {
              app: 'index.html'
          }
      }
    }
  });

  grunt.loadTasks('node_modules/chronicles_of_grunt/tasks/');
  grunt.registerTask('default', ['usage']);
};
```
In the end we load tasks from CoG-module and register `usage`-task as a default.

### General information

The code `name` of the project is required and consisting of alphanumeric characters.
Additionally a human readable `title` can be defined.
Dependencies to other libraries are listed as an array in `external`. The following
predefined constants are supported:

* `angular` --- AngularJS.
* `jquery` --- jQuery.
* `bootstrap` --- Bootstrap.
* `coa` --- Wigy's Chronicles of Angular (implies `angular`).

In addition, default locations of various paths can be changed:
```js
    paths: {
        dist: 'dist/',                     // Build directory where compressed application is stored.
        docs: 'docs/',                     // Build directory for API docs.
        template: 'generated-template.js', // Name of the while, where pre-compiled templates are stored.
    }
```

### Source code

Source code files have various categories. The complete structure is here:

```js
    src: {
        config: ['src/settings.js'],    // Configuration and other source code files that has to be included first.
        models: ['src/models/**/*.js'], // Data model source code files that are included second.
        data: ['data/**/*.js'],         // Data files to be included after models.
        code: ['src/**/*.js'],          // The rest of the source code files.
        css: ['css/*.css'],             // CSS files of the application.
        shell: ['tools/*'],             // Tools written as shell scripts.
        task: ['tasks/*.js'],           // Grunt-task definitions and their support files.
        otherjs: ['misc/*.js'],         // Any other Javascript-files that are not part of the distribution.
        other: ['misc/*.txt'],          // Any other (non-Javascript) files that are not part of the distribution.
    },
    index: {
        app: 'index.html'               // The initial file launcing the application.
    }
```

### Documentation

To generate API documentation with `docs` task, one can select either [ngdocs](https://github.com/angular/angular.js/wiki/Writing-AngularJS-Documentation)
or [jsdoc](http://usejsdoc.org/), which is default.
```js
    docs: {
        engine: 'ngdocs'
    }
```

### Testing

Unit-testing environment and files are specified as follows:

```js
    test: {
        unit: {
            tests: 'test/**/*_spec.js', // Actual tests.
            external: ['jasmine'],           // Testing frameworks and libs.
        }
    }
    index: {
        test: 'test.html'               // Visual presentation of the testing.
    }
```

The unit-testing system supports the following libraries:

* `jasmine` --- Unit-testing library Jasmine.
* `angular-mock` --- Testing library for AngularJS.

For the *Jasmine* testing, the simple visual file can be made by creating a file
```html
<!doctype html>
  <head>
    <title>Unit Tests</title>
    <meta charset="UTF-8">
  </head>
  <body>
  </body>
</html>
```
and then generating necessary CSS- and Javascript-inclusions by running `grunt index`.

### Media files

Binary files that are part of the application are defined under `media`. In addition, optionally
their source files can be defined as well, if they are generated from some other data. For example,
here we create **png** files from **dia** diagrams using simple shell commands.
```js
    media: {
        pics: ['pics/**/*png'],       // All images for the application.
        sounds: ['sounds/**/*.mp3'],  // All sounds for the application.
        src: {
            pics: {
                files: 'dia/**/*.dia',                  // Source data files for the pictures.
                dst: 'pics/{{SUBDIR}}/{{BASENAME}}.png' // Destination file.
                convert: [
                    'dia -n -e "{{DST}}" -t cairo-alpha-png "{{SRC}}"'
                ]
            }
        }
```

The supported variables in double curly braces are:
* `SRC` --- Complete path to the source file.
* `DST` --- Complete path to the destination file.
* `NAME` --- Name of the source file.
* `BASENAME` --- Name of the source file without postfix after dot.
* `DIR` --- Full path of the source file.
* `SUBDIR` --- Path of the source file after removing the first directory.
* `SUBSUBDIR` --- Path of the source file after removing two first directories.

In order to compile them, one can run `build:pics` or `build:sounds` task.

### Templates

If the Javascript-framework listed in use can handle HTML-templates, they can be compiled together into a single file.
The method of compiling depends on the system in use. The system is looked from the option `external` and if found, then
the templates can be used. Currently supported systems for templates are

* `angular` --- AngularJS templates are directly inserted into the template cache when module `templates` is added as dependecy.

```js
    src: {
        templates: 'src/**/*.html',    // A list of HTML-file templates.
    }
```

In order to compile templates, run `build:templates` task.

## Tasks

### Task: `usage`

This task is recommended default. It displays configured tasks that are
available for developer.

### Task: `info`

List summary of all existing application files according to the configuration.

### Task: `libs`

After all requirements are installed with `npm install --save`, this task can be used
to copy all needed files from `node_modules` to the `lib` directory of the project root.

### Task: `index`

Based on the configuration, this builds a list of CSS and Javascript files and
updates configured index-files to include all requirements.

### Task: `verify`

Run syntax checker for project files. Alternatively `verify:js` can be used to verify
Javascript code and `verify:css` can be used to verify CSS.

### Task: `dist`

Build functional minimized application into `dist` directory.

### Task: `version`:*version*

This task can be used to change the version of the current code base.
The version numbers supported have format *x.y.z* for public release or
*x.y.z-beta* for development release. The change is made to the `packages.json`
file. If *version* is not given, then the current version is given.

### Task: `todo`

Display all remaining TODO-entries found from the source code. Additional argument
`todo:die` causes the script end with an error, if any TODO-entries are found.

### Task: `test`

Run all unit-tests defined. Optional arguments are matched against test file names
and if given, only files containing arguments as substrings are selected for running.

### Task: `release`

Run all checks for code and then update README.md file and the version. You can disable
some checks by adding them as separate arguments each: `verify`, `todo`, `files`, `test`.
It is also possible to disable two other standard steps `dist` and `docs`.

### Task: `docs`

Build API-documentation to `docs`-directory using *JSDoc*.

### Task: `auto`

Listen for file changes and automatically run tasks based on the files that have been
changed. By default, all types of automated tasks are watched for changes. If given,
the following argument can be given to follow only one kind of category:

* `docs` to run task `docs` when any source code file changes
* `test` to run task `test` when any Javascript-file or test file changes
* `js` to run `verify:js` when any Javascript-file changes
* `css` to run `verify:css` when any CSS-file changes
* `pics` to run `build:pics` when any picture source file changes
* `sounds` to run `build:sounds` when any sounds source file changes
* `templates` to run `build:templates` when any template file changes
* `build` to run all build-tasks defined when any of their respective source file changes

### Task: `files`

Run complete scan of files in the repository and compare files found to the configuration.
Report all files that does not belong to the configuration or are not commonly known files.
Running `files:die` causes the script end with an error, if any unknown files are found.
With `files:show` we can list all files and see categories how they are seen by the system.

### Task: `build`

Generate files that are created from the source files. By default, everything that can
be found from the configuration, are generated.

If parameter is `pics` or `sounds`, then the corresponding media files are generated.

If parameter is `templates`, then the collection of templates is compiled.


## License

Copyright (c) 2015 Tommi Ronkainen
Licensed under the GPL-2.0 license.

## Release History

* v1.10.0
    - Template builder.
    - Configurable path for distribution, templates and API-docs.
    - After generating docs the `files` task automatically recognizes them.
    - Combine test.unit.css and test.unit.lib parts to test.unit.external.
    - Auto-task for template, pics and sound building.
    - Separate categoroes for other files: Javascript and non-Javascript.
* v1.9.0
    - Configurable documentation system and support now both *jsdoc* or *ngdocs*.
    - Test for `docs` task.
    - Fix `dist` task to produce correct Javascript- and CSS-paths to index file.
    - Include unit-test files to the `verify` checking.
    - Show title in the `info` task.
* v1.8.0
    - Reorganize testing code so that we use new strucutre for testing: {unit: {data: 'test/data/**', lib: 'jasmine', css: 'jasmine'}}.
    - Reorganize media files to structure {media: {pics: '*.png', sounds: '*.pm3'}, and add source file concept for media.
    - Add category for Grunt-task files.
    - Support for media building from source files by configured commands.
    - Check for tabs in `verify`.
* v1.7.0
    - Do not include libraries to the compressed distribution version.
    - Remove uncompressed Javascript-file from the dist-folder after compiling.
    - Task `auto` to use grunt-watch to build docs or running tests or syntax checking.
    - Ability to run just a single test at time.
    - Test for `libs` task.
    - Test for `dist` task.
    - Show *Not Yet Done* section from `README.md` with `todo`.
    - Pre-defined libraries can now have 'needs' attributes, which inserts listed libs before itself to the resolved file list.
    - Simplified handling for external, where list like ['jquery', 'bootstrap', 'jasmine'] will automatically added to correct categories.
    - A task `files` to find every file that does not belong to any recognized category in the repository.
    - Test for `files` task.
    - File category `src.shell`.
* v1.6.0
    - Fix file lookup failing to find files.
    - Do not create empty dist-files if there are no source files.
    - New task `docs` to build API-documentation.
    - Test for `version` task.
    - Test for `release` task.
    - Show version in info-task.
    - Display unit-test libraries and css with `info`-task.
    - Support for *Angular mock* unit-test library.
* v1.5.0
    - Test for `index` task.
    - Task `release` to run all checks before updating release history in README.md and updating version.
* v1.4.0
    - Configurable task output that can be written to a file.
    - Functional testing system and a sample project for unit-testing.
    - Unit-test for `index` task.
    - Unit-test for `todo` task.
    - Unit-test for `verify` task.
    - Add CSS checking to `verify` task.
* v1.3.0
    - Support for `test` task in order to run unit-tests.
    - Support new `other`-category for work files.
    - Scan more files when checking for TODO-notes.
    - New task `todo` to display TODO-notes from source code.
* v1.0.0
    - Basic tasks `info`, `dist`, `index`, `verify`, `usage` and `version`.

## Next Version

### Done

### Not Yet Done

## Future Ideas

* Move non-task files from tasks-directory to lib-directory.
* Split actual tasks to separate files.