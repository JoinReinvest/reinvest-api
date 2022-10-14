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

describe('Given the transaction was created', () => {
    const transactionId = new TransactionId('123456');
    const transaction = new NewlyCreatedTransaction(transactionId);

    context('When system published the created event', () => {
        const investorAccountId = new InvestorAccountId("123456");
        const amountToInvest = new Money(1000.0);
        const portfolioId = new PortfolioId("1");
        const theSameButCreatedSomewhereElseTransactionId = new TransactionId('123456');

        const transactionCreated = new TransactionCreated(theSameButCreatedSomewhereElseTransactionId, portfolioId, investorAccountId, amountToInvest);

        it('Then the transaction should decide to create a trade', async () => {

            const decision: TransactionDecision = transaction.execute(transactionCreated);

            expect(decision.command).is.instanceof(CreateTradeCommand);
            expect(decision.stateChange.status).is.equal(TransactionStep.Same);
        });
    });

    context('When system created a trade', () => {
        const numberOfShares = new NumberOfShares(1000);
        const unitPrice = UnitPrice.fromMoney(new Money(1.0, Currency.USD));
        const tradeCreated = new TradeCreatedEvent(transactionId, numberOfShares, unitPrice);

        it('Then the transaction should decide to initialize funds transfer', async () => {
            const decision: TransactionDecision = transaction.execute(tradeCreated);

            expect(decision.command).is.instanceof(TransferFundsCommand);

            expect(decision.stateChange.status).is.equal(TransactionStep.TradeCreated);
            expect(decision.stateChange.metadata.numberOfShares).is.equal(numberOfShares);
            expect(decision.stateChange.metadata.unitPrice).is.equal(unitPrice);
        });
    });
});