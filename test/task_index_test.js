var runner = require('./runner.js');

module.exports = {

    setUp: function(callback) {
        runner.save('index.html');
        callback();
    },

    tearDown: function(callback) {
        runner.restore('index.html');
        callback();
    },

    'Task `index`': function(test) {
        test.expect(6);
        runner.run('index');
        var content = runner.read('index.html');
        test.ok(content.indexOf('<script src="src/config.js"></script>') > 0, "has no config.js");
        test.ok(content.indexOf('<script src="src/models.js"></script>') > 0, "has no models.js");
        test.ok(content.indexOf('<script src="src/data/data1.js"></script>') > 0, "has no src/data/data1.js");
        test.ok(content.indexOf('<script src="src/data/subdata/data2.js"></script>') > 0, "has no src/data/subdata/data2.js");
        test.ok(content.indexOf('<script src="generated-templates.js"></script>') > 0, "has no generated-templates.js");
        test.ok(content.indexOf('<link rel="stylesheet" href="src/test.css">') > 0, "has no test.css");
        test.done();
  }
};
