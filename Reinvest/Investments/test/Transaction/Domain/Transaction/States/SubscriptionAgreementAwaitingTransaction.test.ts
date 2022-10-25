import {expect} from "chai";

import {Money} from "../../../../../src/Commons/Money";
import {TransactionDecision} from "../../../../../src/Transaction/Domain/TransactionDecision";
import {TransactionState} from "../../../../../src/Transaction/Domain/ValueObject/TransactionState";
import {TradeCreated} from "../../../../../src/Transaction/Domain/Events/TradeCreated";
import {Currency} from "../../../../../src/Commons/Currency";
import {TransactionId} from "../../../../../src/Transaction/Domain/ValueObject/TransactionId";
import {NumberOfShares} from "../../../../../src/Transaction/Domain/ValueObject/NumberOfShares";
import {UnitPrice} from "../../../../../src/Transaction/Domain/ValueObject/UnitPrice";
import {TransferFunds} from "../../../../../src/Transaction/Domain/Command/TransferFunds";
import {DoNothing} from "../../../../../src/Transaction/Domain/Command/DoNothing";
import {Counter} from "../../../../../src/Commons/Counter";
import {WaitForManualAction} from "../../../../../src/Transaction/Domain/Command/WaitForManualAction";
import {FailureCompletionReason} from "../../../../../src/Transaction/Domain/ValueObject/FailureCompletionReason";
import {
    NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION,
    SubscriptionAgreementAwaitingTransaction
} from "../../../../../src/Transaction/Domain/States/SubscriptionAgreementAwaitingTransaction";
import {SubscriptionAgreementSigned} from "../../../../../src/Transaction/Domain/Events/SubscriptionAgreementSigned";
import {
    SubscriptionAgreementSignFailed
} from "../../../../../src/Transaction/Domain/Events/SubscriptionAgreementSignFailed";
import {SignSubscriptionAgreement} from "../../../../../src/Transaction/Domain/Command/SignSubscriptionAgreement";
import {WaitForAdminManualAction} from "../../../../../src/Transaction/Domain/Command/WaitForAdminManualAction";
import {UnwindTrade} from "../../../../../src/Transaction/Domain/Command/UnwindTrade";

context('Given the trade was created and awaiting for a signing the subscription agreement', () => {
    const transactionId = new TransactionId('123456');
    const transaction = new SubscriptionAgreementAwaitingTransaction(transactionId, Counter.init());

    describe('When the subscription agreement was signed', () => {
        const agreementSigned = new SubscriptionAgreementSigned(transactionId);

        it('Then the transaction should initialize the funds transfer', async () => {
            const decision: TransactionDecision = transaction.execute(agreementSigned);

            expect(decision.command).is.instanceof(TransferFunds);
            expect(decision.stateChange.status).is.equal(TransactionState.FundsTransferAwaiting);
        });
    });

    describe('When the subscription agreement failed', () => {
        const agreementSignFailed = new SubscriptionAgreementSignFailed(transactionId);

        it('Then the transaction should be cancelled', async () => {
            const decision: TransactionDecision = transaction.execute(agreementSignFailed);

            expect(decision.command).is.instanceof(UnwindTrade);

            expect(decision.stateChange.status).is.equal(TransactionState.TradeUnwindAwaiting);
            expect(decision.stateChange.metadata.unwindReason).is.equal(FailureCompletionReason.CannotSignSubscriptionAgreement);
        });
    });

    describe('When system re-published a trade created event', () => {
        const numberOfShares = new NumberOfShares(1000);
        const unitPrice = UnitPrice.fromMoney(new Money(1.0, Currency.USD));
        const tradeCreated = new TradeCreated(transactionId, numberOfShares, unitPrice);

        it('Then the transaction should initialize again signing the subscription agreement', async () => {
            const decision: TransactionDecision = transaction.execute(tradeCreated);

            expect(decision.command).is.instanceof(SignSubscriptionAgreement);

            expect(decision.stateChange.status).is.equal(TransactionState.Same);
            expect(decision.stateChange.metadata.numberOfShares).is.undefined;
            expect(decision.stateChange.metadata.unitPrice).is.undefined;
        });

        it('Then if it re-published the event more then max retries then it should request for the manual action', async () => {
            const transaction = new SubscriptionAgreementAwaitingTransaction(transactionId, Counter.init(NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION));
            const decision: TransactionDecision = transaction.execute(tradeCreated);

            expect(decision.command).is.instanceof(WaitForAdminManualAction);
            expect(decision.stateChange.status).is.equal(TransactionState.AdminManualActionAwaiting);
        });
    });
});