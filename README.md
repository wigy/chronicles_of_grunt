# Wigy's Chronicles of Grunt

Wigy's collection of useful utilities for Grunt.

## Getting Started

You may install this plugin with this command:
```shell
npm install wigy/chronicles_of_grunt --save-dev
```

Once installed, it may be enabled in your Gruntfile with:
```js
grunt.loadTasks('node_modules/chronicles_of_grunt/tasks/');
```

## Tasks

### Usage

This task is recommended default. It displays configured tasks that are
available for developer.

### Versioning

This task can be used to change the version of the current code base.
The version numbers supported have format *x.y.z* for public release or
*x.y.z-beta* for development release. The change is made to the `packages.json`
file.
#### Options
##### file
Type: `String`

If the option is given, scan for VERSION and DEBUG variables from the given
file and update them accordingly.

## License

Copyright (c) 2015 Tommi Ronkainen  
Licensed under the GPL-2.0 license.

## Release History

* 0.2.0 Add new `usage` task.
* 0.1.1 Make `versioning` option `file` optional.
* 0.1.0 Bring `versioning` tool from time2exercise.
