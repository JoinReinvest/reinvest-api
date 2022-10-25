import {expect} from "chai";

import {TransactionDecision} from "../../../../../src/Transaction/Domain/TransactionDecision";
import {TransactionState} from "../../../../../src/Transaction/Domain/ValueObject/TransactionState";
import {TransactionId} from "../../../../../src/Transaction/Domain/ValueObject/TransactionId";
import {
    DisbursementAwaitingTransaction
} from "../../../../../src/Transaction/Domain/States/DisbursementAwaitingTransaction";
import {TradeDisbursed} from "../../../../../src/Transaction/Domain/Events/TradeDisbursed";
import {IssueShares} from "../../../../../src/Transaction/Domain/Command/IssueShares";

context('Given the verification success and grace period ended and awaiting for trade disbursement', () => {
    const transactionId = new TransactionId('123456');
    const transaction = new DisbursementAwaitingTransaction(transactionId);
    describe('When the trade was disbursed', () => {
        const tradeDisbursed = new TradeDisbursed(transactionId);

        it('Then the transaction should issue shares to the investor', async () => {
            const decision: TransactionDecision = transaction.execute(tradeDisbursed);

            expect(decision.command).is.instanceof(IssueShares);
            expect(decision.stateChange.status).is.equal(TransactionState.SharesIssuanceAwaiting);
        });
    });
});