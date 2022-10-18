import {expect} from "chai";

import {TransactionCreated} from "../../../../src/Domain/Transaction/Events/TransactionCreated";
import {InvestorAccountId} from "../../../../src/Domain/Commons/InvestorAccountId";
import {Money} from "../../../../src/Domain/Commons/Money";
import {PortfolioId} from "../../../../src/Domain/Commons/PortfolioId";
import {InitializedTransaction} from "../../../../src/Domain/Transaction/States/InitializedTransaction";
import {TransactionDecision} from "../../../../src/Domain/Transaction/TransactionDecision";
import {CreateTrade} from "../../../../src/Domain/Transaction/Command/CreateTrade";
import {TransactionState} from "../../../../src/Domain/Transaction/ValueObject/TransactionState";
import {TransactionId} from "../../../../src/Domain/Transaction/ValueObject/TransactionId";

context('Given the transaction was initialized', () => {
    const transactionId = new TransactionId('123456');
    const transaction = new InitializedTransaction(transactionId);

    describe('When the system starts the investment process', () => {
        const investorAccountId = new InvestorAccountId("123456");
        const amountToInvest = new Money(1000.0);
        const portfolioId = new PortfolioId("1");
        const theSameButCreatedSomewhereElseTransactionId = new TransactionId('123456');

        const transactionCreated = new TransactionCreated(theSameButCreatedSomewhereElseTransactionId, portfolioId, investorAccountId, amountToInvest);

        it('Then the transaction should decide to create a trade', async () => {

            const decision: TransactionDecision = transaction.execute(transactionCreated);

            expect(decision.command).is.instanceof(CreateTrade);
            expect(decision.stateChange.status).is.equal(TransactionState.TradeAwaiting);
        });
    });
});