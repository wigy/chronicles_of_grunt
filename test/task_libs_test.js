var grunt = require('grunt');
var fs = require('fs');

module.exports = {

    setUp: function(callback) {
        grunt.config.set('build', require('./settings.js'));
        callback();
    },

    'Task `libs`': function(test) {
        // TODO: How to silence grunt?
        test.expect(1);
        // TODO: Implement an build-option to put all output to file.
        grunt.task.run('info');
        // TODO: Write actual test.
        test.equal(1, 1);
        test.done();
  }
};
