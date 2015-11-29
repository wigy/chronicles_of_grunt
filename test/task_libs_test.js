var runner = require('./runner.js');
var fs = require('fs');

module.exports = {

    'Task `libs`': function(test) {
        test.expect(2);
        runner.run('libs');
        var lib = runner.read('lib/angular.min.js');
        test.ok(lib.indexOf('Fake Angular JS') > 0, "does not properly set up Javascript-libraries");
        var css = runner.read('css/bootstrap.min.css');
        test.ok(css.indexOf('Fake Bootstrap CSS') > 0, "does not properly set up CSS-libraries");
        // TODO: Replace this with runner tool auto-cleaning all before and after test.
        fs.unlinkSync('test/workdir/lib/angular.min.js');
        fs.unlinkSync('test/workdir/css/bootstrap.min.css');
        fs.rmdirSync('test/workdir/lib');
        fs.rmdirSync('test/workdir/css');

        test.done();
  }
};
