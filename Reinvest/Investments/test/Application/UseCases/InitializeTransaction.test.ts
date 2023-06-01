import { expect } from 'chai';
import { InvestorAccountId } from 'Investments/Domain/TransactionModeled/Commons/InvestorAccountId';
import { PortfolioId } from 'Investments/Domain/TransactionModeled/Commons/PortfolioId';
import { Result } from 'Investments/Domain/TransactionModeled/Commons/Result';
import { UniqueId } from 'Investments/Domain/TransactionModeled/Commons/UniqueId';
import { TransactionRepositoryInterface } from 'Investments/Domain/TransactionModeled/TransactionRepositoryInterface';
import { Money } from 'Money/Money';
import * as sinon from 'ts-sinon';

import { UniqueIdGenerator } from '../../../src/Application/Tools/UniqueIdGenerator';
import { InitializeTransaction } from '../../../src/Application/UseCases/InitializeTransaction';
import { InitializeTransactionCommand } from '../../../src/Application/UseCases/InitializeTransactionCommand';

context('Given the user is an investor', () => {
  const investorAccountId: InvestorAccountId = new InvestorAccountId('123456');

  describe('When the user want to invest some money into REIT portfolio', () => {
    const amountToInvest: Money = new Money(100000);
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
