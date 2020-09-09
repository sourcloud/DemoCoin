const EC = require('elliptic').ec;
const Hash = require('./hash')

const ec = new EC('secp256k1');

const verifySignature = ({ publicKey, data, signature }) => {
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');

    return keyFromPublic.verify(Hash.createSHA256(data), signature);
};

module.exports = { ec, verifySignature, Hash };