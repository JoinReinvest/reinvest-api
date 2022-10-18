import {expect} from "chai";

import {TransactionDecision} from "../../../../../src/Domain/Transaction/TransactionDecision";
import {TransactionState} from "../../../../../src/Domain/Transaction/ValueObject/TransactionState";
import {TransactionId} from "../../../../../src/Domain/Transaction/ValueObject/TransactionId";
import {DoNothing} from "../../../../../src/Domain/Transaction/Command/DoNothing";
import {FailureCompletionReason} from "../../../../../src/Domain/Transaction/ValueObject/FailureCompletionReason";
import {FundsTransferInitialized} from "../../../../../src/Domain/Transaction/Events/FundsTransferInitialized";
import {PaymentAwaitingTransaction} from "../../../../../src/Domain/Transaction/States/PaymentAwaitingTransaction";
import {SuccessfulPayment} from "../../../../../src/Domain/Transaction/Events/SuccessfulPayment";
import {FailedPayment} from "../../../../../src/Domain/Transaction/Events/FailedPayment";

context('Given the funds transfer was initiated and awaiting for payment', () => {
    const transactionId = new TransactionId('123456');
    const transaction = new PaymentAwaitingTransaction(transactionId);

    describe('When the system notifies about successful payment', () => {
        const successfulPayment = new SuccessfulPayment(transactionId);

        it('Then the transaction should do nothing and wait for the end of cancellation period', async () => {
            const decision: TransactionDecision = transaction.execute(successfulPayment);

            expect(decision.command).is.instanceof(DoNothing);
            expect(decision.stateChange.status).is.equal(TransactionState.CancellationPeriodEndAwaiting);
        });
    });

    describe('When the payment failed', () => {
        const failedPayment = new FailedPayment(transactionId);

        it('Then the transaction should complete with failure', async () => {
            const decision: TransactionDecision = transaction.execute(failedPayment);

            expect(decision.command).is.instanceof(DoNothing);

            expect(decision.stateChange.status).is.equal(TransactionState.CompletedWithFailure);
            expect(decision.stateChange.metadata.failureReason).is.equal(FailureCompletionReason.PaymentFailed);
        });
    });

    describe('When the system re-published the funds transfer initiated event', () => {
        const fundsTransferInitiatedEvent = new FundsTransferInitialized(transactionId);

        it('Then the transaction should do nothing', async () => {
            const decision: TransactionDecision = transaction.execute(fundsTransferInitiatedEvent);

            expect(decision.command).is.instanceof(DoNothing);
            expect(decision.stateChange.status).is.equal(TransactionState.Same);
        });
    });
});