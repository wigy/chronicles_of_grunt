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
npm install wigy/chronicles_of_grunt --save-dev
```

Once installed, it may be enabled in your Gruntfile with:
```js
grunt.loadTasks('node_modules/chronicles_of_grunt/tasks/');
```

## Configuration

The recommended default task displays available commands:
```js
grunt.registerTask('default', ['usage']);
```

The configuration has few settings and definitions for every source file. Each
source file specification can be:

* A file glob pattern as a string.
* Predefined label for known library as a string.
* An array of either kind of previous specifications.

For example, here is a full configuration:
```js
grunt.initConfig({
  build: {
    options: {
    name: "time2exercise",
    external: {
        lib: ['coa', 'jquery', 'bootstrap'],
        css: ['bootstrap'],
        fonts: ['bootstrap'],
        unittestlib: ['jasmine'],
        unittestcss: ['jasmine'],
    },
    src: {
        config: ['src/settings.js', 'src/utils.js'],
        models: 'src/models/**/*.js',
        data: 'data/**/*.js',
        code: 'src/**/*.js',
        pics: 'pics/**/*png',
        sounds: 'sounds/**/*.mp3',
        css: 'css/*.css',
        shell: 'tools/*'
    },
    test: {
        unit: 'test/*_spec.js'
    },
    index: {
        app: 'index.html',
        test: 'test.html',
    },
  }
});
```

### `name`
This is a code name of the project consisting of alphanumeric characters.

### `external.lib`, `external.css`, `external.fonts`
These defines external libraries to use. First one is for (minimized) code files,
the second (minimized) CSS-files and the third one is for fonts. The following
predefined constants are supported:
* `angular` --- AngularJS.
* `jquery` --- jQuery.
* `bootstrap` --- Bootstrap.
* `coa` --- Wigy's Chronicles of Angular (implies `angular`).
* `jasmine` --- Unit-testing library Jasmine.
* `angular-mock` --- Testing library for AngularJS.

Instead of defining categories separately, you can also define simple list:
```js
    external: ['coa', 'jquery', 'bootstrap'],
```

### `external.unittestlib`, `external.unittestcss`
These are external libraries for HTML-based unit test runner. Supported predefined
constants are:
* `jasmine` --- Jasmine unit testing.

### `src.config`
Configuration and other source code files that has to be included first.

### `src.models`
Data model source code files that are included second.

### `src.data`
Data files to be included after models.

### `src.code`
The rest of the source code files.

### `src.css`
CSS files of the application.

### `src.pics`, `src.sounds`
Media files needed by the application.

### `src.shell`
Tools written as shell scripts.

### `src.other`
Other Javascript-files that are not part of the actual distribution.

### `index.app`, `index.test`
Starting files for the application and for testing.

### `log_file`
If set, the output of tasks are written to that file.

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

Build API-documentation to `doc`-directory using *JSDoc*.

### Task: `auto`

Listen for file changes and automatically run `docs`, `test`, `verify:css` or `verify:js`
based on the argument (use `css` or `js` for `verify`). Default is `docs`.

### Task: `files`

Run complete scan of files in the repository and compare files found to the configuration.
Report all files that does not belong to the configuration or are not commonly known files.
Running `files:die` causes the script end with an error, if any unknown files are found.
With `files:show` we can list all files and see categories how they are seen by the system.

## License

Copyright (c) 2015 Tommi Ronkainen
Licensed under the GPL-2.0 license.

## Release History

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
* v1.3.1
    - Add CSS checking to `verify` task.
* v1.3.0
    - Support for `test` task in order to run unit-tests.
* v1.2.0
    - Support new `other`-category for work files.
* v1.1.1
    - Scan more files when checking for TODO-notes.
* v1.1.0
    - New task `todo` to display TODO-notes from source code.
* v1.0.0
    - Documentation and clean up.
* v0.6.0
    - Rename tasks to be used without prefix and move all tasks to the same file.
* v0.5.0
    - Add `build:dist` task.
* v0.4.0
    - Add `build:index` task.
* v0.3.0
    - Add `build:info` and `build:verify` tasks.
* v0.2.0
    - Add new `usage` task.
* v0.1.1
    - Make `versioning` option `file` optional.
* v0.1.0
    - Bring in `versioning` tool from *time2exercise*.

## Next Version

### Done

* Reorganize testing code so that we use new strucutre for testing: {unit: {data: 'test/data/**', lib: 'jasmine', css: 'jasmine'}}.

### Not Yet Done

## Future Ideas

* Reorganize media files to structure {media: {pics: '*.png', sounds: '*.pm3'}} and leave current for real source data for media.
* Media source categories with transformation rules and transformation support task (build:media and in future build:templates, build:data).
* Check for tabs in `verify`.
* Documentation support for Angular.
* Test for `docs` task.
* Make cleaner documentation in this file. Start with simple hello world and combine different configuration variable explanations together.
* Add category for Grunt-task files.
