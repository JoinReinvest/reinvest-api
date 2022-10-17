import {expect} from "chai";

import {TransactionDecision} from "../../../../src/Domain/Transaction/TransactionDecision";
import {TransactionState} from "../../../../src/Domain/Transaction/ValueObject/TransactionState";
import {TransactionId} from "../../../../src/Domain/Transaction/ValueObject/TransactionId";
import {
    CancellationPeriodEndAwaitingTransaction
} from "../../../../src/Domain/Transaction/States/CancellationPeriodEndAwaitingTransaction";
import {CancellationPeriodEnded} from "../../../../src/Domain/Transaction/Events/CancellationPeriodEnded";
import {IssueShares} from "../../../../src/Domain/Transaction/Command/IssueShares";

describe('Given the payment was successful and awaiting when cancellation period end', () => {
    const transactionId = new TransactionId('123456');
    const transaction = new CancellationPeriodEndAwaitingTransaction(transactionId);

    context('When the cancellation period end', () => {
        const cancellationPeriodEnded = new CancellationPeriodEnded(transactionId);

        it('Then the transaction should request shares issuance', async () => {
            const decision: TransactionDecision = transaction.execute(cancellationPeriodEnded);

            expect(decision.command).is.instanceof(IssueShares);
            expect(decision.stateChange.status).is.equal(TransactionState.SharesIssuanceAwaiting);
        });
    });
});