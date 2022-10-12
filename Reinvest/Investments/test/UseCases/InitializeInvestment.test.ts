import {expect} from "chai";
import {Result} from "../../src/UseCases/Commons/Result";
import exp = require("constants");

describe('Given the user is an investor', () => {
    const investorAccountId: InvestorAccountId = new InvestorAccountId("123456");

    context('When the user want to invest some money into REIT portfolio', () => {
        const amountToInvest: Money = new Money(1000.0, "USD");
        const portfolioId: PortfolioId = new PortfolioId("1");

        it('Then the new investment should be initialized', async () => {
            const command: InvestCommand = new InvestCommand(portfolioId, investorAccountId, amountToInvest);
            const investmentUseCase: InitializeInvestment = new InitializeInvestment();

            const result: Result = await investmentUseCase.invest(command);

            expect(result).is.equal(Result.Success);
        });
    });
});