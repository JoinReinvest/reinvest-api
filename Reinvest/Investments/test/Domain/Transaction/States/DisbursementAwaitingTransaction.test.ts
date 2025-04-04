import { expect } from 'chai';
import { IssueShares } from 'Investments/Domain/TransactionModeled/Command/IssueShares';
import { TradeDisbursed } from 'Investments/Domain/TransactionModeled/Events/TradeDisbursed';
import { DisbursementAwaitingTransaction } from 'Investments/Domain/TransactionModeled/States/DisbursementAwaitingTransaction';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';
import { TransactionState } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionState';

context('Given the verification success and grace period ended and awaiting for trade disbursement', () => {
  const transactionId = new TransactionId('123456');
  const transaction = new DisbursementAwaitingTransaction(transactionId);
  describe('When the trade was disbursed', () => {
    const tradeDisbursed = new TradeDisbursed(transactionId);

    it('Then the transaction should issue shares to the investor', async () => {
      const decision: TransactionDecision = transaction.execute(tradeDisbursed);

      expect(decision.command).is.instanceof(IssueShares);
      expect(decision.stateChange.status).is.equal(TransactionState.SharesIssuanceAwaiting);
    });
  });
});
