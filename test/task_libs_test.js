var grunt = require('grunt');
var child_process = require('child_process');

module.exports = {

    'Task `libs`': function(test) {
        // TODO: How to silence grunt?
        test.expect(1);
        // TODO: Implement an build-option to put all output to file.
        var out = child_process.spawnSync('grunt', ['info'], {cwd: 'test'});
        // TODO: Think if we need special logging at all and remove.
        console.log(out.stdout.toString())
        // TODO: Write actual test.
        test.equal(1, 1);
        test.done();
  }
};
