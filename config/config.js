const MINE_RATE = 1000;         // in milliseconds 

const INITIAL_DIFFICULTY = 2;

const GENESIS_DATA = {
    timestamp: 0,
    lastHash: '-----',
    hash: 'hash zero',
    data: [],
    nonce: 0,
    difficulty: INITIAL_DIFFICULTY
}

module.exports = {GENESIS_DATA, MINE_RATE};