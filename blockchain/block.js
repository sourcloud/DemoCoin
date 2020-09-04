const hexToBinary = require('hex-to-binary');
const Hash = require('./hash');
const { GENESIS_DATA, MINE_RATE } = require('../config/config');

class Block {

    constructor({timestamp, lastHash, hash, data, nonce, difficulty}) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis() {
        return new Block(GENESIS_DATA);
    }

    static mine({lastBlock, data}) {

        const lastHash = lastBlock.hash;
        
        let hash, timestamp, difficulty, expectedLeadingZeros;
        let nonce = 0;

        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({originalBlock: lastBlock, timestamp});
            hash = Hash.createSHA256(timestamp, lastHash, data, nonce, difficulty);
            expectedLeadingZeros = '0'.repeat(difficulty)
        } while (hexToBinary(hash).substring(0, difficulty) !== expectedLeadingZeros);

        return new Block({timestamp, lastHash, data, difficulty, nonce, hash});
    }

    static adjustDifficulty({originalBlock, timestamp}) {
        const minimum = 0;
        const {difficulty} = originalBlock;
        const timeDelta = timestamp - originalBlock.timestamp;

        if (timeDelta > MINE_RATE) {
            const newDifficulty = difficulty - 1;
            return (newDifficulty >= minimum) ? newDifficulty : minimum;
        }

        return difficulty + 1;
    }

}

module.exports = Block;