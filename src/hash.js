const crypto = require('crypto');

class Hash {

    static createSHA256(...inputs) {
        const hash = crypto.createHash('sha256');
        hash.update(inputs.sort().join(' '));
        return hash.digest('hex');
    }

}

module.exports = Hash;