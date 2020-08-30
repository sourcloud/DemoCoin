const Block = require('./block');
const Hash = require('./hash')

class Blockchain {

    constructor() {
        this.chain = [Block.genesis()];
    }

    add({data}) {
        const lastBlock = this.chain[this.chain.length -1];
        const newBlock = Block.mine({lastBlock, data});
        this.chain.push(newBlock);
    }

    replaceChain(chain) {
        if (chain.length <= this.chain.length) {
            console.error('Incoming chain must be longer!');
            return;
        } else if (!Blockchain.validate(chain)) {
            console.error('Incoming chain must be valid!');
            return;
        }

        console.log('Replaced with',chain);
        this.chain = chain;
    }

    static validate(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
            return false;

        for (let i = 1; i < chain.length; i++) {        
            const {timestamp, lastHash, hash, data, nonce, difficulty} = chain[i];
            const lastDifficulty = chain[i-1].difficulty;
            const actualLastHash = chain[i-1].hash;
            const difficultyDelta = Math.abs(difficulty - lastDifficulty);
            const validHash = Hash.createSHA256(timestamp, lastHash, data, nonce, difficulty);

            if (lastHash !== actualLastHash || hash !== validHash || difficultyDelta > 1)
                return false;
        }

        return true;
    }

}

module.exports = Blockchain;
