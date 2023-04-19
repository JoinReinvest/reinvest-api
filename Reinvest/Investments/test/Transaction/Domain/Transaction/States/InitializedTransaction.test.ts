import { expect } from 'chai';

import { InvestorAccountId } from '../../../../../src/Commons/InvestorAccountId';
import { Money } from '../../../../../src/Commons/Money';
import { PortfolioId } from '../../../../../src/Commons/PortfolioId';
import { CreateTrade } from '../../../../../src/Transaction/Domain/Command/CreateTrade';
import { TransactionCreated } from '../../../../../src/Transaction/Domain/Events/TransactionCreated';
import { InitializedTransaction } from '../../../../../src/Transaction/Domain/States/InitializedTransaction';
import { TransactionDecision } from '../../../../../src/Transaction/Domain/TransactionDecision';
import { TransactionId } from '../../../../../src/Transaction/Domain/ValueObject/TransactionId';
import { TransactionState } from '../../../../../src/Transaction/Domain/ValueObject/TransactionState';

context('Given the transaction was initialized', () => {
  const transactionId = new TransactionId('123456');
  const transaction = new InitializedTransaction(transactionId);

  describe('When the system starts the investment process', () => {
    const investorAccountId = new InvestorAccountId('123456');
    const amountToInvest = new Money(1000.0);
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
