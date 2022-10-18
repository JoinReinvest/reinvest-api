import {expect} from "chai";

import {TransactionDecision} from "../../../../src/Domain/Transaction/TransactionDecision";
import {TransactionState} from "../../../../src/Domain/Transaction/ValueObject/TransactionState";
import {TransactionId} from "../../../../src/Domain/Transaction/ValueObject/TransactionId";
import {Counter} from "../../../../src/Domain/Commons/Counter";
import {ManualActionReason} from "../../../../src/Domain/Transaction/ValueObject/ManualActionReason";
import {WaitForAdminManualAction} from "../../../../src/Domain/Transaction/Command/WaitForAdminManualAction";
import {TransactionCancelled} from "../../../../src/Domain/Transaction/Events/TransactionCancelled";
import {UnwindTrade} from "../../../../src/Domain/Transaction/Command/UnwindTrade";
import {DoNothing} from "../../../../src/Domain/Transaction/Command/DoNothing";
import {FailureCompletionReason} from "../../../../src/Domain/Transaction/ValueObject/FailureCompletionReason";
import {
    NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION,
    TradeUnwindAwaitingTransaction
} from "../../../../src/Domain/Transaction/States/TradeUnwindAwaitingTransaction";
import {TradeUnwound} from "../../../../src/Domain/Transaction/Events/TradeUnwound";
import {TradeUnwoundFailed} from "../../../../src/Domain/Transaction/Events/TradeUnwoundFailed";

context('Given the transaction was cancelled and the system is awaiting for trade unwind', () => {
    const transactionId = new TransactionId('123456');
    const transaction = new TradeUnwindAwaitingTransaction(transactionId, Counter.init());

    describe('When the system unwound the trade', () => {
        const tradeUnwound = new TradeUnwound(transactionId);

        it('Then the transaction should complete with failure', async () => {
            const decision: TransactionDecision = transaction.execute(tradeUnwound);

            expect(decision.command).is.instanceof(DoNothing);

            expect(decision.stateChange.status).is.equal(TransactionState.CompletedWithFailure);
            expect(decision.stateChange.metadata.failureReason).is.equal(FailureCompletionReason.TransactionCancelled);
        });
    });

    describe('When system was not able to unwind the trade', () => {
        const tradeUnwoundFailed = new TradeUnwoundFailed(transactionId);

        it('Then the transaction should decide to wait for admin manual action', async () => {
            const decision: TransactionDecision = transaction.execute(tradeUnwoundFailed);

            expect(decision.command).is.instanceof(WaitForAdminManualAction);

            expect(decision.stateChange.status).is.equal(TransactionState.AdminManualActionAwaiting);
            expect(decision.stateChange.metadata.manualActionReason).is.equal(ManualActionReason.TradeUnwindFailed);
        });
    });

    describe('When system re-published a transaction cancelled event', () => {
        const transactionCancelled = new TransactionCancelled(transactionId);

        it('Then the transaction should initialize again the trade unwinding process', async () => {
            const decision: TransactionDecision = transaction.execute(transactionCancelled);

            expect(decision.command).is.instanceof(UnwindTrade);

            expect(decision.stateChange.status).is.equal(TransactionState.Same);
        });

        it('Then if it re-published the event more then max retries then it should request for the admin manual action', async () => {
            const transaction = new TradeUnwindAwaitingTransaction(transactionId, Counter.init(NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION));
            const decision: TransactionDecision = transaction.execute(transactionCancelled);

            expect(decision.command).is.instanceof(WaitForAdminManualAction);
            expect(decision.stateChange.status).is.equal(TransactionState.AdminManualActionAwaiting);
            expect(decision.stateChange.metadata.manualActionReason).is.equal(ManualActionReason.CannotInitializeUnwindingProcess);
        });
    });
});