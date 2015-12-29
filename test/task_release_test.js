var runner = require('./runner.js');

module.exports = {

    'Task `release`': function(test) {
        test.expect(1);
        runner.save('README.md');
        runner.save('package.json');
        runner.run('release:todo:test:docs:verify:dist:files:build');
        var content = runner.read('README.md');
        runner.restore('README.md');
        runner.restore('package.json');
        test.equal(content, "## Release History\n\n* v0.0.1\n    - Basic set up for running release testing.\n* v0.0.0\n    - Initial file collection.\n\n## Next Version\n\n### Done\n\n### Not Yet Done");

        test.done();
  }
};
