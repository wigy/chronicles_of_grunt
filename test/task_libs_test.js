var grunt = require('grunt');
var child_process = require('child_process');

module.exports = {

    'Task `libs`': function(test) {
        test.expect(1);
        var out = child_process.spawnSync('grunt', ['info'], {cwd: 'test/workdir'});
        console.log(out.stdout.toString())
        // TODO: Write actual test.
        test.equal(1, 1);
        test.done();
  }
};
