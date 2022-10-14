import {expect} from "chai";

import {TransactionCreated} from "../../../../src/Domain/Transaction/Events/TransactionCreated";
import {InvestorAccountId} from "../../../../src/Domain/Commons/InvestorAccountId";
import {Money} from "../../../../src/Domain/Commons/Money";
import {PortfolioId} from "../../../../src/Domain/Commons/PortfolioId";
import {NewlyCreatedTransaction} from "../../../../src/Domain/Transaction/Steps/NewlyCreatedTransaction";
import {TransactionDecision} from "../../../../src/Domain/Transaction/TransactionDecision";
import {CreateTradeCommand} from "../../../../src/Domain/Transaction/Command/CreateTradeCommand";
import {TransactionStep} from "../../../../src/Domain/Transaction/TransactionStep";
import {TradeCreatedEvent} from "../../../../src/Domain/Transaction/Events/TradeCreatedEvent";
import {Currency} from "../../../../src/Domain/Commons/Currency";
import {TransactionId} from "../../../../src/Domain/Transaction/ValueObject/TransactionId";
import {NumberOfShares} from "../../../../src/Domain/Transaction/ValueObject/NumberOfShares";
import {UnitPrice} from "../../../../src/Domain/Transaction/ValueObject/UnitPrice";
import {TransferFundsCommand} from "../../../../src/Domain/Transaction/Command/TransferFundsCommand";
import {TradeCreatedTransaction} from "../../../../src/Domain/Transaction/Steps/TradeCreatedTransaction";
import {FundsTransferInitiatedEvent} from "../../../../src/Domain/Transaction/Events/FundsTransferInitiatedEvent";
import {Wait} from "../../../../src/Domain/Transaction/Command/Wait";
import {Counter} from "../../../../src/Domain/Commons/Counter";

describe('Given the trade was created', () => {
    const transactionId = new TransactionId('123456');
    const transaction = new TradeCreatedTransaction(transactionId, Counter.init());

    context('When the system published the funds transfer initiated event', () => {
        const fundsTransferInitiatedEvent = new FundsTransferInitiatedEvent(transactionId);

        it('Then the transaction should wait and do nothing', async () => {
            const decision: TransactionDecision = transaction.execute(fundsTransferInitiatedEvent);

            expect(decision.command).is.instanceof(Wait);
            expect(decision.stateChange.status).is.equal(TransactionStep.FundsTransferInitiated);
        });
    });

    context('When system re-published a trade created event', () => {
        const numberOfShares = new NumberOfShares(1000);
        const unitPrice = UnitPrice.fromMoney(new Money(1.0, Currency.USD));
        const tradeCreated = new TradeCreatedEvent(transactionId, numberOfShares, unitPrice);

        it('Then the transaction should initialize again the transfer funds', async () => {
            const decision: TransactionDecision = transaction.execute(tradeCreated);

            expect(decision.command).is.instanceof(TransferFundsCommand);

            expect(decision.stateChange.status).is.equal(TransactionStep.Same);
            expect(decision.stateChange.metadata.numberOfShares).is.undefined;
            expect(decision.stateChange.metadata.unitPrice).is.undefined;
        });
    });
});