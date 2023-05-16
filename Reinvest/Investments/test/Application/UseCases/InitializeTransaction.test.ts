import { expect } from 'chai';
import { TransactionRepositoryInterface } from 'Reinvest/Investments/src/Domain/TransactionRepositoryInterface';
import * as sinon from 'ts-sinon';

import { UniqueIdGenerator } from '../../../src/Application/Tools/UniqueIdGenerator';
import { InitializeTransaction } from '../../../src/Application/UseCases/InitializeTransaction';
import { InitializeTransactionCommand } from '../../../src/Application/UseCases/InitializeTransactionCommand';
import { InvestorAccountId } from '../../../src/Commons/InvestorAccountId';
import { Money } from '../../../src/Commons/Money';
import { PortfolioId } from '../../../src/Commons/PortfolioId';
import { Result } from '../../../src/Commons/Result';
import { UniqueId } from '../../../src/Commons/UniqueId';

context('Given the user is an investor', () => {
  const investorAccountId: InvestorAccountId = new InvestorAccountId('123456');

  describe('When the user want to invest some money into REIT portfolio', () => {
    const amountToInvest: Money = new Money(1000.0);
    const portfolioId: PortfolioId = new PortfolioId('1');
    const transactionRepository = sinon.stubInterface<TransactionRepositoryInterface>();
    const idGenerator = sinon.stubInterface<UniqueIdGenerator>();
    idGenerator.create.returns(new UniqueId('123789'));

    it('Then the new transaction should be initialized', async () => {
      const command: InitializeTransactionCommand = new InitializeTransactionCommand(portfolioId, investorAccountId, amountToInvest);
      const initializeTransactionUseCase: InitializeTransaction = new InitializeTransaction(transactionRepository, idGenerator);

      const result: Result = await initializeTransactionUseCase.execute(command);

      expect(result).is.equal(Result.Success);
    });
  });
});
