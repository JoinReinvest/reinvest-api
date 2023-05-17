import { expect } from 'chai';
import { CreateTrade } from 'Investments/Domain/TransactionModeled/Command/CreateTrade';
import { InvestorAccountId } from 'Investments/Domain/TransactionModeled/Commons/InvestorAccountId';
import { PortfolioId } from 'Investments/Domain/TransactionModeled/Commons/PortfolioId';
import { TransactionCreated } from 'Investments/Domain/TransactionModeled/Events/TransactionCreated';
import { InitializedTransaction } from 'Investments/Domain/TransactionModeled/States/InitializedTransaction';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';
import { TransactionState } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionState';
import { Money } from 'Money/Money';

context('Given the transaction was initialized', () => {
  const transactionId = new TransactionId('123456');
  const transaction = new InitializedTransaction(transactionId);

  describe('When the system starts the investment process', () => {
    const investorAccountId = new InvestorAccountId('123456');
    const amountToInvest = new Money(100000);
    const portfolioId = new PortfolioId('1');
    const theSameButCreatedSomewhereElseTransactionId = new TransactionId('123456');

    const transactionCreated = new TransactionCreated(theSameButCreatedSomewhereElseTransactionId, portfolioId, investorAccountId, amountToInvest);

    it('Then the transaction should decide to create a trade', async () => {
      const decision: TransactionDecision = transaction.execute(transactionCreated);

      expect(decision.command).is.instanceof(CreateTrade);
      expect(decision.stateChange.status).is.equal(TransactionState.TradeAwaiting);
    });
  });
});
