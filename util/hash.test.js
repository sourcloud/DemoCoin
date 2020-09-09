const Hash = require('./hash');

describe('createSHA256()', () => {

    const normalOrderHash = Hash.createSHA256('Hello', 'World');

    it('generates a valid SHA256 hash', () => {
        const helloWorldHash = '72b81d30128ae192ca5f49eb111299f6dcee4ba8328a6eb28aebd46a1cb169b3';
        expect(normalOrderHash).toEqual(helloWorldHash);
    });

    it('produces the same hash with the same input arguments in any order', () => {
        const differentOrderHash = Hash.createSHA256('World', 'Hello');
        expect(normalOrderHash).toEqual(differentOrderHash);
    });

    it('produces a unique hash if properties have changed on an input', () => {
        const testObject = {};
        const originalHash = Hash.createSHA256(testObject);
        testObject['test'] = 'test';
        const changedHash = Hash.createSHA256(testObject);
        expect(originalHash).not.toEqual(changedHash);
    });

});