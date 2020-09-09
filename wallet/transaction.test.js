const Transaction = require('./transaction');
const Wallet = require('./index');
const { verifySignature } = require('../util');

describe('Transaction', () => {

    let transaction, senderWallet, recipient, amount;

    beforeEach(() => {
        senderWallet = new Wallet();
        recipient = 'recipient-public-key';
        amount = 50;
        transaction = new Transaction({senderWallet, recipient, amount});
    });

    it('has an `id`', () => {
        expect(transaction).toHaveProperty('id');
    });

    describe('outputMap', () => {

        it('has an `outputMap`', () => {
            expect(transaction).toHaveProperty('outputMap');
        });

        it('maps the amount to the recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it('maps the remaining balance to the `senderWallet`', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
        });
    });

    describe('input', () => {

        it('has an `input`', () => {
            expect(transaction).toHaveProperty('input');
        });

        it('has a `timestamp` in the input', () => {
            expect(transaction.input).toHaveProperty('timestamp');
        });

        it('sets the `amount` to the sendeWallet balance', () => {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });

        it('sets the `address` to the senderWallet publicKey', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });

        it('signs the input', () => {
            expect(
                verifySignature({
                    publicKey: senderWallet.publicKey,
                    data: transaction.outputMap,
                    signature: transaction.input.signature
                })
            ).toBe(true);
        });
    });

    describe('validate()', () => {

        let errorMock;

        beforeEach(() => {
            errorMock = jest.fn(),
            global.console.error = errorMock
        });

        describe('if the transaction is valid', () => {

            it('returns true', () => {
                expect(Transaction.validate(transaction)).toBe(true);
            });

        });

        describe('if the transaction is invalid', () => {

            describe('and a transaction outputMap value is invalid', () => {
                
                it('returns false and logs an error', () => {
                    transaction.outputMap[senderWallet.publicKey] = 123456;
                    expect(Transaction.validate(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });

            });

            describe('and the transaction input signature is invalid', () => {
                
                it('returns false and logs an error', () => {
                    transaction.input.signature = new Wallet().sign('data');
                    expect(Transaction.validate(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });

            });
        });
    });

    describe('update()', () => {

        describe('and the amount is invalid', () => {
            it('throws an error', () => {
                expect(() => {
                    transaction.update({senderWallet, recipient: 'test-recipient', amount: 123456});
                }).toThrow('Amount exceeds balance!');
            });
        });

        describe('and the amount is valid', () => {

            let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

            beforeEach(() => {
                originalSignature = transaction.input.signature;
                originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
                nextRecipient = 'next recipient';
                nextAmount = 50;
    
                transaction.update({
                    senderWallet, 
                    recipient: nextRecipient, 
                    amount: nextAmount
                });
            });
    
            it('maps the amount to the next recipient', () => {
                expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
            });
    
            it('subtracts the amount from the original sender output amount', () => {
                expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount);
            });
    
            it('maintains a total output amount that matches the input amount', () => {
                expect(
                    Object.values(transaction.outputMap).reduce((total, outputAmount) => {
                        return total + outputAmount;
                    })
                ).toEqual(transaction.input.amount);
            });
    
            it('re-signs the transaction', () => {
                expect(transaction.input.signature).not.toEqual(originalSignature);
            });

            describe('and another update for the same recipient', () => {
                let addedAmount;

                beforeEach(() => {
                    addedAmount = 100;
                    transaction.update({senderWallet, recipient: nextRecipient, amount: addedAmount});
                });

                it('adds to the recipient amount', () => {
                    expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount + addedAmount);
                });

                it('subtracts the amount from the original sender output amount', () => {
                    expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount - addedAmount);
                });
            });
        });

    });

});