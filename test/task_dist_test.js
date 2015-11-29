var runner = require('./runner.js');
var fs = require('fs');

module.exports = {

    'Task `dist`': function(test) {

        test.expect(4);

        runner.clean('test/workdir/dist');
        runner.clean('test/workdir/lib');
        runner.clean('test/workdir/css');

        runner.run('libs');
        runner.run('dist');
        var index = runner.read('dist/index.html');
        test.ok(index.indexOf('cog_unittest.min.js') > 0, "does not contain reference to cog_unittest.min.js");
        test.ok(index.indexOf('cog_unittest.min.css') > 0, "does not contain reference to cog_unittest.min.css");
        var css = runner.read('dist/cog_unittest.min.css');
        test.ok(css.indexOf('color') > 0, "does not have color definition in cog_unittest.min.css");
        var js = runner.read('dist/cog_unittest.min.js');
        test.ok(js.indexOf('212345') > 0, "does not have known constant in cog_unittest.min.js");

        runner.clean('test/workdir/dist');
        runner.clean('test/workdir/lib');
        runner.clean('test/workdir/css');

        test.done();
  }
};
