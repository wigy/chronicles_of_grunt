var runner = require('./runner.js');

module.exports = {

    'Task `version`': function(test) {
        test.expect(1);
        runner.save('package.json');
        runner.run('version:9.9.9');
        var pckg = JSON.parse(runner.read('package.json'));
        test.ok(pckg.version === '9.9.9', "fails to write new version");
        runner.restore('package.json');
        test.done();
  }
};
