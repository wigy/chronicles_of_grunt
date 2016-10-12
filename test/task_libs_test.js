var runner = require('./runner.js');
var fs = require('fs');

module.exports = {

    'Task `libs`': function(test) {

        test.expect(2);

        runner.clean('test/workdir/output/libs');
        runner.clean('test/workdir/css');

        runner.run('libs');
        var lib = runner.read('output/libs/angular.min.js');
        test.ok(lib.indexOf('Fake Angular JS') > 0, "does not properly set up Javascript-libraries");
        var css = runner.read('css/bootstrap.min.css');
        test.ok(css.indexOf('Fake Bootstrap CSS') > 0, "does not properly set up CSS-libraries");

        runner.clean('test/workdir/output/libs');
        runner.clean('test/workdir/css');

        test.done();
  }
};
