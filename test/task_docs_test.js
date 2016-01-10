var runner = require('./runner.js');

module.exports = {

    'Task `docs`': function(test) {
        test.expect(1);
        runner.clean('test/workdir/output');
        runner.run('docs');
        // We just check the documentation index file that it is in place and looks like containing our docs.
        var content = runner.read('output/api/js/docs-setup.js');
        test.ok(content.indexOf('This is just a magic number for testing.') > 0, "docs cannot be found found defined in config.js");
        runner.clean('test/workdir/output');
        test.done();
  }
};
