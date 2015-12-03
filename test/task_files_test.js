var runner = require('./runner.js');

module.exports = {

    'Task `files`': function(test) {
        test.expect(2);
        runner.run('files');
        test.ok(runner.hasLine("? unknown-file.js"), "fails to detect unknown-file.js");
        test.ok(runner.hasLine("1 file(s) unknown."), "counts files correctly");

        test.done();
  }
};
