import {expect} from "chai";

import {TransactionDecision} from "../../../../../src/Transaction/Domain/TransactionDecision";
import {TransactionState} from "../../../../../src/Transaction/Domain/ValueObject/TransactionState";
import {TransactionId} from "../../../../../src/Transaction/Domain/ValueObject/TransactionId";
import {
    CancellationPeriodEndAwaitingTransaction
} from "../../../../../src/Transaction/Domain/States/CancellationPeriodEndAwaitingTransaction";
import {CancellationPeriodEnded} from "../../../../../src/Transaction/Domain/Events/CancellationPeriodEnded";
import {IssueShares} from "../../../../../src/Transaction/Domain/Command/IssueShares";

context('Given the payment was successful and awaiting when cancellation period end', () => {
    const transactionId = new TransactionId('123456');
    const transaction = new CancellationPeriodEndAwaitingTransaction(transactionId);

    describe('When the cancellation period end', () => {
        const cancellationPeriodEnded = new CancellationPeriodEnded(transactionId);

        it('Then the transaction should request shares issuance', async () => {
            const decision: TransactionDecision = transaction.execute(cancellationPeriodEnded);

            expect(decision.command).is.instanceof(IssueShares);
            expect(decision.stateChange.status).is.equal(TransactionState.SharesIssuanceAwaiting);
        });
    });
});