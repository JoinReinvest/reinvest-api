import { expect } from 'chai';
import { DoNothing } from 'Investments/Domain/TransactionModeled/Command/DoNothing';
import { WaitForAdminManualAction } from 'Investments/Domain/TransactionModeled/Command/WaitForAdminManualAction';
import { SharesId } from 'Investments/Domain/TransactionModeled/Commons/SharesId';
import { SharesIssuanceFailed } from 'Investments/Domain/TransactionModeled/Events/SharesIssuanceFailed';
import { SharesWereIssued } from 'Investments/Domain/TransactionModeled/Events/SharesWereIssued';
import { SharesIssuanceAwaitingTransaction } from 'Investments/Domain/TransactionModeled/States/SharesIssuanceAwaitingTransaction';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';
import { ManualActionReason } from 'Investments/Domain/TransactionModeled/ValueObject/ManualActionReason';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';
import { TransactionState } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionState';

context('Given the trade was disbursed and awaiting for shares issuance', () => {
  const transactionId = new TransactionId('123456');
  const transaction = new SharesIssuanceAwaitingTransaction(transactionId);

  describe('When the system issues shares', () => {
    const sharesId = new SharesId('1');
    const sharesWereIssued = new SharesWereIssued(transactionId, sharesId);

    it('Then the transaction should be successful', async () => {
      const decision: TransactionDecision = transaction.execute(sharesWereIssued);

      expect(decision.command).is.instanceof(DoNothing);
      expect(decision.stateChange.status).is.equal(TransactionState.CompletedWithSuccess);
      expect(decision.stateChange.metadata.sharesId).is.equal(sharesId);
    });
  });

  describe('When the shares issuance fails', () => {
    const sharesIssuanceFailed = new SharesIssuanceFailed(transactionId);

    it('Then the system should wait for the admin manual action', async () => {
      const decision: TransactionDecision = transaction.execute(sharesIssuanceFailed);

      expect(decision.command).is.instanceof(WaitForAdminManualAction);
      expect(decision.stateChange.status).is.equal(TransactionState.AdminManualActionAwaiting);
      expect(decision.stateChange.metadata.manualActionReason).is.equal(ManualActionReason.SharesIssuanceFailed);
    });
  });
});
