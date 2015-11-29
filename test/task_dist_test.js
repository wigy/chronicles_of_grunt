var runner = require('./runner.js');
var fs = require('fs');

module.exports = {

    'Task `dist`': function(test) {
        test.expect(4);
        runner.run('libs');
        runner.run('dist');
        var index = runner.read('dist/index.html');
        test.ok(index.indexOf('cog_unittest.min.js') > 0, "does not contain reference to cog_unittest.min.js");
        test.ok(index.indexOf('cog_unittest.min.css') > 0, "does not contain reference to cog_unittest.min.css");
        var css = runner.read('dist/cog_unittest.min.css');
        test.ok(css.indexOf('color') > 0, "does not have color definition in cog_unittest.min.css");
        var js = runner.read('dist/cog_unittest.min.js');
        test.ok(js.indexOf('212345') > 0, "does not have known constant in cog_unittest.min.js");
        // TODO: Replace this with runner tool auto-cleaning all before and after test.
        fs.unlinkSync('test/workdir/dist/index.html');
        fs.unlinkSync('test/workdir/dist/lib/angular.min.js');
        fs.unlinkSync('test/workdir/dist/cog_unittest.min.css');
        fs.unlinkSync('test/workdir/dist/cog_unittest.min.js');
        fs.rmdirSync('test/workdir/dist/lib');
        fs.rmdirSync('test/workdir/dist');
        fs.unlinkSync('test/workdir/lib/angular.min.js');
        fs.unlinkSync('test/workdir/css/bootstrap.min.css');
        fs.rmdirSync('test/workdir/lib');
        fs.rmdirSync('test/workdir/css');
        test.done();
  }
};
