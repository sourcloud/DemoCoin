const Blockchain = require('./');
const Block = require('./block');
const { Hash } = require('../util');

describe('Blockchain', () => {
    let blockchain;

    beforeEach(() => {
        blockchain = new Blockchain();
    });

    it('contains a `Array`instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with the genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the chain', () => {
        const newData = 'Hello World';
        blockchain.add({data: newData});
        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });

    describe('validate()', () => {
        
        describe('if the chain does not start with the genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = {data: 'wrong genesis'};
                expect(Blockchain.validate(blockchain.chain)).toBe(false);
            });
        });

        describe('if the chain starts with the genesis block and has multiple blocks', () => {

            beforeEach(() => {
                blockchain.add({data: 'Grizzly'});
                blockchain.add({data: 'Panda'});
                blockchain.add({data: 'Icebear'});
            });

            describe('and a `lastHash` has changed', () => {
                it('returns false', () => {
                    blockchain.chain[2].lastHash = 'wrong last hash';
                    expect(Blockchain.validate(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with an invalid field', () => {
                it('returns false', () => {
                    blockchain.chain[2].data = 'modified data';
                    expect(Blockchain.validate(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a difficulty jump', () => {
                it('returns false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length-1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty - 3;
                    const hash = Hash.createSHA256(timestamp, lastHash, data, nonce, difficulty);
                    const invalidBlock = new Block({timestamp, lastHash, hash, data, nonce, difficulty}); 

                    blockchain.chain.push(invalidBlock);

                    expect(Blockchain.validate(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain does not contain any invalid blocks', () => {
                it('returns true', () => {
                    expect(Blockchain.validate(blockchain.chain)).toBe(true);
                });
            });
        });

    });

    describe('replaceChain()', () => {
        let newChain, originalChain, errorMock, logMock;

        beforeEach(() => {
            newChain = new Blockchain();
            originalChain = blockchain.chain;

            errorMock = jest.fn();
            logMock = jest.fn();
            global.console.error = errorMock;
            global.console.log = logMock
        });

        describe('if the new chain is not longer', () => {

            beforeEach(() => {
                newChain.chain[0] = {new: 'chain'};
                blockchain.replaceChain(newChain.chain);
            });

            it('does not replace the chain', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            it('logs an error', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('if the new chain is longer', () => {

            beforeEach(() => {
                newChain.add({data: 'Grizzly'});
                newChain.add({data: 'Panda'});
                newChain.add({data: 'Icebear'});
            });

            describe('and the new chain is invalid', () => {

                beforeEach(() => {
                    newChain.chain[2].hash = 'invalid hash';
                    blockchain.replaceChain(newChain.chain);
                });

                it('does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the new chain is valid', () => {

                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });

                it('replaces the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                it('logs the replacement', () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });

        });
    });

});