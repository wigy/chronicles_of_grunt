(function(){

// TODO: Rename this file.
var grunt = require('grunt');

var settings =  {
    options: {
        name: 'unit_test',
        work_dir: 'test/work_dir',
        src: {
        },
        test: {
        },
        external: {
            lib: ['nodeunit']
        },
        index: {
            test: 'index.html'
        },
    }
};

module.exports = {


    'first test group': function(test) {
        // TODO: Write tests for every task we have.'
        // TODO: How to silence grunt?
        test.expect(1);
        // TODO: Wrong setting is displayed here.
        grunt.config.set('build', settings);
        var config = grunt.config.get();
        console.log(config);
        grunt.task.run('info');
        test.equal(false, false);
        test.done();
  }
};

})();
