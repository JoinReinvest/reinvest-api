import {expect} from "chai";

import {Money} from "../../../../../src/Domain/Commons/Money";
import {TransactionDecision} from "../../../../../src/Domain/Transaction/TransactionDecision";
import {TransactionState} from "../../../../../src/Domain/Transaction/ValueObject/TransactionState";
import {TradeCreated} from "../../../../../src/Domain/Transaction/Events/TradeCreated";
import {Currency} from "../../../../../src/Domain/Commons/Currency";
import {TransactionId} from "../../../../../src/Domain/Transaction/ValueObject/TransactionId";
import {NumberOfShares} from "../../../../../src/Domain/Transaction/ValueObject/NumberOfShares";
import {UnitPrice} from "../../../../../src/Domain/Transaction/ValueObject/UnitPrice";
import {TransferFunds} from "../../../../../src/Domain/Transaction/Command/TransferFunds";
import {FundsTransferInitialized} from "../../../../../src/Domain/Transaction/Events/FundsTransferInitialized";
import {DoNothing} from "../../../../../src/Domain/Transaction/Command/DoNothing";
import {Counter} from "../../../../../src/Domain/Commons/Counter";
import {WaitForManualAction} from "../../../../../src/Domain/Transaction/Command/WaitForManualAction";
import {
    FundsTransferAwaitingTransaction,
    NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION
} from "../../../../../src/Domain/Transaction/States/FundsTransferAwaitingTransaction";
import {FundsTransferInitializationFailed} from "../../../../../src/Domain/Transaction/Events/FundsTransferInitializationFailed";
import {FailureCompletionReason} from "../../../../../src/Domain/Transaction/ValueObject/FailureCompletionReason";

context('Given the trade was created and awaiting for a funds transfer initialization', () => {
    const transactionId = new TransactionId('123456');
    const transaction = new FundsTransferAwaitingTransaction(transactionId, Counter.init());

    describe('When the system initializes the funds transfer', () => {
        const fundsTransferInitiatedEvent = new FundsTransferInitialized(transactionId);

        it('Then the transaction should do nothing and waits for payment', async () => {
            const decision: TransactionDecision = transaction.execute(fundsTransferInitiatedEvent);

            expect(decision.command).is.instanceof(DoNothing);
            expect(decision.stateChange.status).is.equal(TransactionState.PaymentAwaiting);
        });
    });

    describe('When the funds transfer failed', () => {
        const fundsTransferFailed = new FundsTransferInitializationFailed(transactionId);

        it('Then the transaction should complete with failure', async () => {
            const decision: TransactionDecision = transaction.execute(fundsTransferFailed);

            expect(decision.command).is.instanceof(DoNothing);

            expect(decision.stateChange.status).is.equal(TransactionState.CompletedWithFailure);
            expect(decision.stateChange.metadata.failureReason).is.equal(FailureCompletionReason.FundsTransferInitializationFailed);
        });
    });

    describe('When system re-published a trade created event', () => {
        const numberOfShares = new NumberOfShares(1000);
        const unitPrice = UnitPrice.fromMoney(new Money(1.0, Currency.USD));
        const tradeCreated = new TradeCreated(transactionId, numberOfShares, unitPrice);

        it('Then the transaction should initialize again the transfer funds', async () => {
            const decision: TransactionDecision = transaction.execute(tradeCreated);

            expect(decision.command).is.instanceof(TransferFunds);

            expect(decision.stateChange.status).is.equal(TransactionState.Same);
            expect(decision.stateChange.metadata.numberOfShares).is.undefined;
            expect(decision.stateChange.metadata.unitPrice).is.undefined;
        });

        it('Then if it re-published the event more then max retries then it should request for the manual action', async () => {
            const transaction = new FundsTransferAwaitingTransaction(transactionId, Counter.init(NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION));
            const decision: TransactionDecision = transaction.execute(tradeCreated);

            expect(decision.command).is.instanceof(WaitForManualAction);
            expect(decision.stateChange.status).is.equal(TransactionState.ManualActionAwaiting);
        });
    });
});