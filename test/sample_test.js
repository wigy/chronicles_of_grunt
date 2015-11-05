(function(){

var grunt = require('grunt');

module.exports = {


    setUp: function (callback) {
        // Initialize here.
        // TODO: Configure separate test work directory.
        callback();
    },
    tearDown: function (callback) {
        // Clean up here.
        callback();
    },

    'first test group': function(test) {
        // TODO: Write tests for every task we have.'
        // TODO: How to silence grunt?
        grunt.task.run('version');
        test.equal(false, false);
        test.done();
  }
};

})();
