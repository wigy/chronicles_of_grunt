var runner = require('./runner.js');

module.exports = {

    'Task `libs`': function(test) {
        test.expect(1);
        runner.run('info');
        test.ok(runner.hasLine("Project: cog_unittest"), "shows project name incorrectly");
        // TODO: Write test for some sample file listings.
        test.done();
  }
};
