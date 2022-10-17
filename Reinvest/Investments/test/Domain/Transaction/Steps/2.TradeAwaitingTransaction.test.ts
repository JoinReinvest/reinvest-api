import {expect} from "chai";

import {Money} from "../../../../src/Domain/Commons/Money";
import {TransactionDecision} from "../../../../src/Domain/Transaction/TransactionDecision";
import {TransactionState} from "../../../../src/Domain/Transaction/ValueObject/TransactionState";
import {TradeCreated} from "../../../../src/Domain/Transaction/Events/TradeCreated";
import {Currency} from "../../../../src/Domain/Commons/Currency";
import {TransactionId} from "../../../../src/Domain/Transaction/ValueObject/TransactionId";
import {NumberOfShares} from "../../../../src/Domain/Transaction/ValueObject/NumberOfShares";
import {UnitPrice} from "../../../../src/Domain/Transaction/ValueObject/UnitPrice";
import {TransferFunds} from "../../../../src/Domain/Transaction/Command/TransferFunds";
import {Counter} from "../../../../src/Domain/Commons/Counter";
import {
    NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION,
    TradeAwaitingTransaction
} from "../../../../src/Domain/Transaction/States/TradeAwaitingTransaction";
import {InvestorAccountId} from "../../../../src/Domain/Commons/InvestorAccountId";
import {PortfolioId} from "../../../../src/Domain/Commons/PortfolioId";
import {TransactionCreated} from "../../../../src/Domain/Transaction/Events/TransactionCreated";
import {CreateTrade} from "../../../../src/Domain/Transaction/Command/CreateTrade";
import {ManualActionReason} from "../../../../src/Domain/Transaction/ValueObject/ManualActionReason";
import {TradeFailed} from "../../../../src/Domain/Transaction/Events/TradeFailed";
import {WaitForAdminManualAction} from "../../../../src/Domain/Transaction/Command/WaitForAdminManualAction";
import {TransactionCancelled} from "../../../../src/Domain/Transaction/Events/TransactionCancelled";
import {UnwindTrade} from "../../../../src/Domain/Transaction/Command/UnwindTrade";

describe('Given the investment was created and awaiting for trade created event', () => {
    const transactionId = new TransactionId('123456');
    const transaction = new TradeAwaitingTransaction(transactionId, Counter.init());

    context('When system created a trade', () => {
        const numberOfShares = new NumberOfShares(1000);
        const unitPrice = UnitPrice.fromMoney(new Money(1.0, Currency.USD));
        const tradeCreated = new TradeCreated(transactionId, numberOfShares, unitPrice);

        it('Then the transaction should decide to initialize funds transfer', async () => {
            const decision: TransactionDecision = transaction.execute(tradeCreated);

            expect(decision.command).is.instanceof(TransferFunds);

            expect(decision.stateChange.status).is.equal(TransactionState.FundsTransferAwaiting);
            expect(decision.stateChange.metadata.numberOfShares).is.equal(numberOfShares);
            expect(decision.stateChange.metadata.unitPrice).is.equal(unitPrice);
        });
    });

    context('When system was not able to create a trade', () => {
        const tradeFailed = new TradeFailed(transactionId);

        it('Then the transaction should decide to wait for manual action', async () => {
            const decision: TransactionDecision = transaction.execute(tradeFailed);

            expect(decision.command).is.instanceof(WaitForAdminManualAction);

            expect(decision.stateChange.status).is.equal(TransactionState.AdminManualActionAwaiting);
            expect(decision.stateChange.metadata.manualActionReason).is.equal(ManualActionReason.TradeCreationFailed);
        });
    });

    context('When system re-published a transaction created event', () => {
        const investorAccountId = new InvestorAccountId("123456");
        const amountToInvest = new Money(1000.0);
        const portfolioId = new PortfolioId("1");
        const theSameButCreatedSomewhereElseTransactionId = new TransactionId('123456');

        const transactionCreated = new TransactionCreated(theSameButCreatedSomewhereElseTransactionId, portfolioId, investorAccountId, amountToInvest);


        it('Then the transaction should initialize again the trade creation process', async () => {
            const decision: TransactionDecision = transaction.execute(transactionCreated);

            expect(decision.command).is.instanceof(CreateTrade);

            expect(decision.stateChange.status).is.equal(TransactionState.Same);
            expect(decision.stateChange.metadata.numberOfShares).is.undefined;
            expect(decision.stateChange.metadata.unitPrice).is.undefined;
        });

        it('Then if it re-published the event more then max retries then it should request for the admin manual action', async () => {
            const transaction = new TradeAwaitingTransaction(transactionId, Counter.init(NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION));
            const decision: TransactionDecision = transaction.execute(transactionCreated);

            expect(decision.command).is.instanceof(WaitForAdminManualAction);
            expect(decision.stateChange.status).is.equal(TransactionState.AdminManualActionAwaiting);
            expect(decision.stateChange.metadata.manualActionReason).is.equal(ManualActionReason.CannotCreateTrade);
        });
    });

    context('When a user cancelled the trade', () => {
        const transactionCancelled = new TransactionCancelled(transactionId);

        it('Then the trade should be unwind', async () => {
            const decision: TransactionDecision = transaction.execute(transactionCancelled);

            expect(decision.command).is.instanceof(UnwindTrade);

            expect(decision.stateChange.status).is.equal(TransactionState.TradeUnwindAwaiting);
        });
    });
});