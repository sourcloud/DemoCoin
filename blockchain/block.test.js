
const hexToBinary = require('hex-to-binary');
const Block = require('../src/block');
const Hash = require('../src/hash');
const { GENESIS_DATA, MINE_RATE } = require('../config/config');

describe('Block', () => {
    const timestamp = 2000;
    const lastHash = 'test last';
    const hash = 'test current';
    const data = ['test', 'data'];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({timestamp, lastHash, hash, data, nonce, difficulty});

    it('has a timestamp property', () => {
        expect(block.timestamp).toEqual(timestamp);
    });
    
    it('has a lastHash property', () => {
        expect(block.lastHash).toEqual(lastHash);
    });

    it('has a hash property', () => {
        expect(block.hash).toEqual(hash);
    });

    it('has a data property', () => {
        expect(block.data).toEqual(data);
    });

    it('has a nonce property', () => {
        expect(block.nonce).toEqual(nonce);
    });

    it('has a difficulty property', () => {
        expect(block.difficulty).toEqual(difficulty);
    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        it('returns an instance of block', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('returns the genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('mine()', () => {
        const lastBlock = Block.genesis();
        const data = 'mined data';
        const minedBlock = Block.mine({lastBlock, data});

        it('returns an instance of block', () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('sets `lastHash` property to `hash` property of `lastBlock`', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('sets the `data`', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('sets a `timestamp`', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('creates a SHA256 `hash` based on the proper inputs', () => {
            expect(minedBlock.hash)
                .toEqual(
                    Hash.createSHA256(
                        minedBlock.timestamp, 
                        minedBlock.nonce,
                        minedBlock.difficulty,
                        lastBlock.hash, 
                        data
                    )
                )
        });

        it('sets a `hash` that meets the difficulty criteria', () => {
            const leadingChars = hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty);
            const expectedLeadingZeros = '0'.repeat(minedBlock.difficulty);
            expect(leadingChars).toEqual(expectedLeadingZeros);
        });

        it('adjusts the difficulty', () => {
            const possibleResults = [lastBlock.difficulty + 1, lastBlock.difficulty - 1];
            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        });

    });

    describe('adjustDifficulty', () => {

        it('increases difficulty for a quickly mined block', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block, 
                timestamp: block.timestamp + MINE_RATE - 100
            })).toEqual(block.difficulty + 1);
        });

        it('decreases difficulty for a slowly mined block', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block, 
                timestamp: block.timestamp + MINE_RATE + 100
            })).toEqual(block.difficulty - 1);
        });

        it('has a lower limit of 0', () => {
            block.difficulty = -1;
            expect(Block.adjustDifficulty({
                originalBlock: block,
            })).toEqual(0);
        });
    });

});