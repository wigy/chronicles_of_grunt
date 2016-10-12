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
        test.expect(7);
        runner.run('index');
        var content = runner.read('index.html');
        test.ok(content.indexOf('<script src="output/libs/angular.min.js"></script><!-- Added by CoG -->') > 0, "has no output/libs/angular.min.js");
        test.ok(content.indexOf('<script src="src/config.js"></script><!-- Added by CoG -->') > 0, "has no src/config.js");
        test.ok(content.indexOf('<script src="src/models.js"></script><!-- Added by CoG -->') > 0, "has no src/models.js");
        test.ok(content.indexOf('<script src="src/data/data1.js"></script><!-- Added by CoG -->') > 0, "has no src/data/data1.js");
        test.ok(content.indexOf('<script src="src/data/subdata/data2.js"></script><!-- Added by CoG -->') > 0, "has no src/data/subdata/data2.js");
        test.ok(content.indexOf('<script src="output/template.js"></script><!-- Added by CoG -->') > 0, "has no output/template.js");
        test.ok(content.indexOf('<link rel="stylesheet" href="src/test.css"><!-- Added by CoG -->') > 0, "has no src/test.css");
        test.done();
  }
};
