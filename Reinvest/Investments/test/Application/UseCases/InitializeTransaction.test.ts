import {expect} from "chai";
import * as sinon from "ts-sinon";

import {InvestorAccountId} from "../../../src/Model/InvestorAccountId";
import {Result} from "../../../src/Application/Commons/Result";
import {Money} from "../../../src/Model/Money";
import {PortfolioId} from "../../../src/Model/PortfolioId";
import {InitializeTransactionCommand} from "../../../src/Application/UseCases/InitializeTransactionCommand";
import {TransactionRepositoryInterface} from "../../../src/Application/ProcessManager/Transaction/TransactionRepositoryInterface";
import {InitializeTransaction} from "../../../src/Application/UseCases/InitializeTransaction";

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