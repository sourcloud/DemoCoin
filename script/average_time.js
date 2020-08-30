const Blockchain = require('../src/blockchain');

const blockchain = new Blockchain();

blockchain.add({data: 'initial'});

let prevTimestamp, nextTimestamp, nextBlock, timeDelta, average;

const times = [];

for (let i = 0; i < 10000; i++) {
    prevTimestamp = blockchain.chain[blockchain.chain.length-1].timestamp;

    blockchain.add({data: `Block ${i}`});
    nextBlock = blockchain.chain[blockchain.chain.length-1];

    nextTimestamp = nextBlock.timestamp;
    timeDelta = nextTimestamp - prevTimestamp;
    times.push(timeDelta);

    average = times.reduce((total, num) => (total + num)) / times.length;

    console.log(`Mining Time: ${timeDelta}ms. Difficulty: ${nextBlock.difficulty}. Average: ${average}ms`);
}



