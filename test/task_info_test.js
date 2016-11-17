var runner = require('./runner.js');

module.exports = {

    'Task `info`': function(test) {
        test.expect(6);
        runner.run('info');
        test.ok(runner.hasLine("Project: cog_unittest"), "shows project name incorrectly");
        var files = runner.parse();
        test.deepEqual(files['Index files'], ['index.html'], "has incorrect index file list");
        test.deepEqual(files['Configuration and global utilities'], ['src/config.js'], "has incorrect configuration file list");
        test.deepEqual(files['Model files'], ['src/models.js'], "has incorrect model file list");
        test.deepEqual(files['Source data files'], ['src/data/data1.js', 'src/data/subdata/data2.js'], "has incorrect data file list");
        test.deepEqual(files['CSS-files'], ['src/test.css'], "has incorrect CSS file list");

        test.done();
  }
};
