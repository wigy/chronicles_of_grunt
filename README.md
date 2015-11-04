# Wigy's Chronicles of Grunt

Wigy's collection of useful utilities for Grunt. The focus of these utilities
is to provide easy way to develop complete web-applications, that can be build
as an install packages. The development itself happens directly in the browser,
which loads entry point HTML-file of the application and works out of the box.
To achieve this, certain conventions needs to be followed.

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
build: {
    options: {
    name: "time2exercise",
    work_dir: ".",
    external: {
        lib: ['angular', 'jquery', 'bootstrap', 'coa'],
        css: ['bootstrap'],
        fonts: ['bootstrap'],
        unittestlib: ['jasmine'],
        unittestcss: ['jasmine'],
    },
    src: {
        config: ['src/settings.js', 'src/utils.js'],
        models: ['src/models/**/*.js'],
        data: ['data/**/*.js'],
        code: ['src/**/*.js'],
        pics: ['pics/**/*png'],
        sounds: ['sounds/**/*.mp3'],
        css: ['css/*.css'],
    },
    test: {
        unit: 'test/*_spec.js'
    },
    index: {
        app: 'index.html',
        test: 'test.html',
    },
}
```

### `name`
This is a code name of the project consisting of alphanumeric characters.

### `work_dir`
This is a path prefix to be added on work files and defaults to `.`.

### `external.lib`, `external.css`, `external.fonts`
These defines external libraries to use. First one is for (minimized) code files,
the second (minimized) CSS-files and the third one is for fonts. The following
predefined constants are supported:
* `angular` --- AngularJS
* `jquery` --- jQuery
* `bootstrap` --- Bootstrap
* `coa` --- Wigy's Chronicles of Angular

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

### `src.other`
Other Javascript-files that are not part of the actual distribution.

### `index.app`, `index.test`
Starting files for the application and for testing.

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

Run syntax checker for project files.

### Task: `dist`

Build functional minimized application into `dist` directory.

### Task: `version`:*version*

This task can be used to change the version of the current code base.
The version numbers supported have format *x.y.z* for public release or
*x.y.z-beta* for development release. The change is made to the `packages.json`
file. If *version* is not given, then the current version is given.

### Task: `todo`

Display all remaining TODO-entries found from the source code.

## License

Copyright (c) 2015 Tommi Ronkainen
Licensed under the GPL-2.0 license.

## Release History

* 1.3.0 Support for `test` task in order to run unit-tests.
* 1.2.0 Support new `other`-category for work files.
* 1.1.1 Scan more files when checking for TODO-notes.
* 1.1.0 New task `todo` to display TODO-notes from source code.
* 1.0.0 Documentation and clean up.
* 0.6.0 Rename tasks to be used without prefix and move all tasks to the same file.
* 0.5.0 Add `build:dist` task.
* 0.4.0 Add `build:index` task.
* 0.3.0 Add `build:info` and `build:verify` tasks.
* 0.2.0 Add new `usage` task.
* 0.1.1 Make `versioning` option `file` optional.
* 0.1.0 Bring `versioning` tool from time2exercise.

## Future Plans

* Task `release` to run `verify` and `todo:die` before asking comment for release history and running `version`.
* Use `grunt-contrib-csslint` to check syntax for CSS.
* Support for doc-file like README.md and include them for TODO-checking.
* A task to find every file that does not belong to any recognized category in the repository.
* Support for testing system, which can test tasks of CoG (perhaps nodeunit).