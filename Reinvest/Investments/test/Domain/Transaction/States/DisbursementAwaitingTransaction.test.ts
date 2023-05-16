import { expect } from 'chai';
import { IssueShares } from 'Reinvest/Investments/src/Domain/Command/IssueShares';
import { TradeDisbursed } from 'Reinvest/Investments/src/Domain/Events/TradeDisbursed';
import { DisbursementAwaitingTransaction } from 'Reinvest/Investments/src/Domain/States/DisbursementAwaitingTransaction';
import { TransactionDecision } from 'Reinvest/Investments/src/Domain/TransactionDecision';
import { TransactionId } from 'Reinvest/Investments/src/Domain/ValueObject/TransactionId';
import { TransactionState } from 'Reinvest/Investments/src/Domain/ValueObject/TransactionState';

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
