import {expect} from "chai";

import {TransactionDecision} from "../../../../../src/Transaction/Domain/TransactionDecision";
import {TransactionState} from "../../../../../src/Transaction/Domain/ValueObject/TransactionState";
import {TransactionId} from "../../../../../src/Transaction/Domain/ValueObject/TransactionId";
import {
    ManualActionAwaitingTransaction
} from "../../../../../src/Transaction/Domain/States/ManualActionAwaitingTransaction";
import {Counter} from "../../../../../src/Commons/Counter";
import {TransactionResumed} from "../../../../../src/Transaction/Domain/Events/TransactionResumed";
import {ResumeLastEvent} from "../../../../../src/Transaction/Domain/Command/ResumeLastEvent";
import {TransactionCancelled} from "../../../../../src/Transaction/Domain/Events/TransactionCancelled";
import {UnwindTrade} from "../../../../../src/Transaction/Domain/Command/UnwindTrade";
import {TransactionForcedToQuit} from "../../../../../src/Transaction/Domain/Events/TransactionForcedToQuit";
import {DoNothing} from "../../../../../src/Transaction/Domain/Command/DoNothing";
import {FailureCompletionReason} from "../../../../../src/Transaction/Domain/ValueObject/FailureCompletionReason";

context('Given the transaction is awaiting for manual action', () => {
    const transactionId = new TransactionId('123456');
    const lastTransactionState = TransactionState.PaymentAwaiting;
    const transaction = new ManualActionAwaitingTransaction(transactionId, lastTransactionState);

    describe('When a user resumes the transaction', () => {
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

    describe('When an admin cancelled the transaction', () => {
        const transactionCancelled = new TransactionCancelled(transactionId);

        it('Then the trade should be unwind', async () => {
            const decision: TransactionDecision = transaction.execute(transactionCancelled);

            expect(decision.command).is.instanceof(UnwindTrade);
            expect(decision.stateChange.status).is.equal(TransactionState.TradeUnwindAwaiting);
        });
    });

    describe('When an admin forced the transaction to quit', () => {
        const transactionForcedToQuit = new TransactionForcedToQuit(transactionId);

        it('Then the transaction should be completed with failure', async () => {
            const decision: TransactionDecision = transaction.execute(transactionForcedToQuit);

            expect(decision.command).is.instanceof(DoNothing);
            expect(decision.stateChange.status).is.equal(TransactionState.CompletedWithFailure);
            expect(decision.stateChange.metadata.failureReason).is.equal(FailureCompletionReason.TransactionForcedManuallyToQuit);
        });
    });

});