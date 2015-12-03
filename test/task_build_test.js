var runner = require('./runner.js');

module.exports = {

    'Task `build`': function(test) {

        test.expect(2);

        runner.clean('test/workdir/pics');

        runner.run('build:pics');
        var ascii1 = runner.read('pics/sub/1.ascii');
        test.ok(ascii1 == 'Hello\n', "builds pics/sub/1.ascii incorrectly");
        var ascii11 = runner.read('pics/sub/sub/1.1.ascii');
        test.ok(ascii11 == 'Double Dot\n', "builds pics/sub/sub/1.1.ascii incorrectly");

        runner.clean('test/workdir/pics');

        test.done();
  }
};
