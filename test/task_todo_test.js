var runner = require('./runner.js');

module.exports = {

    'Task `todo`': function(test) {
        test.expect(1);
        runner.run('todo');
        test.deepEqual(runner.parse('TODO-entries open'), '6', "counts TODO-entries incorrectly");

        test.done();
  }
};
