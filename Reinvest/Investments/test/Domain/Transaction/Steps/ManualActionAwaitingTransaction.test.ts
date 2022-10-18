import {expect} from "chai";

import {TransactionDecision} from "../../../../src/Domain/Transaction/TransactionDecision";
import {TransactionState} from "../../../../src/Domain/Transaction/ValueObject/TransactionState";
import {TransactionId} from "../../../../src/Domain/Transaction/ValueObject/TransactionId";
import {
    ManualActionAwaitingTransaction
} from "../../../../src/Domain/Transaction/States/ManualActionAwaitingTransaction";
import {Counter} from "../../../../src/Domain/Commons/Counter";
import {TransactionResumed} from "../../../../src/Domain/Transaction/Events/TransactionResumed";
import {ResumeLastEvent} from "../../../../src/Domain/Transaction/Command/ResumeLastEvent";

context('Given the transaction is awaiting manual action', () => {
    const transactionId = new TransactionId('123456');
    const lastTransactionState = TransactionState.PaymentAwaiting;
    const transaction = new ManualActionAwaitingTransaction(transactionId, lastTransactionState);

    describe('When a user resumed the transaction', () => {
        const transactionResumed = new TransactionResumed(transactionId);

        it('Then the transaction should resume the last state', async () => {
            const decision: TransactionDecision = transaction.execute(transactionResumed);

            expect(decision.command).is.instanceof(ResumeLastEvent);
            const command = decision.command as ResumeLastEvent;
            expect(command.state).is.equal(lastTransactionState);

            expect(decision.stateChange.status).is.equal(lastTransactionState);
            const counter = decision.stateChange.metadata.lastActionRetryCounter as Counter;
            expect(counter.isHigherEqualThan(0)).is.true;
        });
    });
});