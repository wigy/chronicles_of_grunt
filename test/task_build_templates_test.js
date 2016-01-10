var runner = require('./runner.js');

module.exports = {

    'Task `build:templates`': function(test) {

        test.expect(2);

        runner.delete('output/template.js');

        runner.run('build:templates');
        var result = runner.read('output/template.js');
        test.ok(result.indexOf('<b>Hi</b>') >= 0, "embeds src/template1.html incorrectly");
        test.ok(result.indexOf('<i>Ho</i>') >= 0, "embeds src/template2.html incorrectly");

        runner.delete('output/template.js');

        test.done();
  }
};
