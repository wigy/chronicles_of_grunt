var runner = require('./runner.js');

module.exports = {

    'Task `usage`': function(test) {

        var tasks = ['auto', 'build', 'dist', 'docs', 'files', 'index', 'info', 'libs', 'release', 'test', 'todo', 'verify', 'version'];

        test.expect(1);
        runner.run('usage');
        test.deepEqual(runner.grep(/(\w+)\s+=>\s+/), tasks, "has wrong list of tasks");

        test.done();
  }
};
