describe('Chronicles of Grunt', function() {

    it('should have unit tests', function() {
        expect(true).toBe(true);
    });

    it('loads source code correctly', function() {
        expect(sample()).toBe(2015);
    });

});

// TODO: Drop this file.
// TODO: Ability to detect testing system based on configured external testing lib.
