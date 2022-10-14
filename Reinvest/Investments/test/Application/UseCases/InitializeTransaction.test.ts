import {expect} from "chai";
import * as sinon from "ts-sinon";

import {Result} from "../../../src/Domain/Commons/Result";
import {InitializeTransactionCommand} from "../../../src/Application/UseCases/InitializeTransactionCommand";
import {InitializeTransaction} from "../../../src/Application/UseCases/InitializeTransaction";
import {InvestorAccountId} from "../../../src/Domain/Commons/InvestorAccountId";
import {Money} from "../../../src/Domain/Commons/Money";
import {PortfolioId} from "../../../src/Domain/Commons/PortfolioId";
import {TransactionRepositoryInterface} from "../../../src/Domain/Transaction/TransactionRepositoryInterface";

describe('Given the user is an investor', () => {
    const investorAccountId: InvestorAccountId = new InvestorAccountId("123456");

    context('When the user want to invest some money into REIT portfolio', () => {
        const amountToInvest: Money = new Money(1000.0);
        const portfolioId: PortfolioId = new PortfolioId("1");

        it('Then the new transaction should be initialized', async () => {
            const command: InitializeTransactionCommand = new InitializeTransactionCommand(portfolioId, investorAccountId, amountToInvest);
            const transactionRepository = sinon.stubInterface<TransactionRepositoryInterface>();

            const initializeTransactionUseCase: InitializeTransaction = new InitializeTransaction(transactionRepository);

            const result: Result = await initializeTransactionUseCase.execute(command);

            expect(result).is.equal(Result.Success);
        });
    });
});