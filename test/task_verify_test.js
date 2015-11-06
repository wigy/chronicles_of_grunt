var runner = require('./runner.js');

module.exports = {

    'Task `verify`': function(test) {
        test.expect(2);
        runner.run('verify');
        test.ok(runner.hasLine("5 files lint free."), "fails to test Javascript-files");
        test.ok(runner.hasLine("1 file lint free."), "fails to test CSS-files");
        test.done();
  }
};
