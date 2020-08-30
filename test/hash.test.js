const Hash = require('../src/hash');

describe('createSHA256()', () => {

    const helloWorldHash = 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e';
    const normalOrderHash = Hash.createSHA256('Hello', 'World');
    const differentOrderHash = Hash.createSHA256('World', 'Hello');

    it('generates a valid SHA256 hash', () => {
        expect(normalOrderHash).toEqual(helloWorldHash);
    });

    it('produces the same hash with the same input arguments in any order', () => {
        expect(normalOrderHash).toEqual(differentOrderHash);
    });

});