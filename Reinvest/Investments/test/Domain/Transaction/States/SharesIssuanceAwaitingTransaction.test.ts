import { expect } from 'chai';
import { SharesId } from 'Reinvest/Investments/src/Commons/SharesId';
import { DoNothing } from 'Reinvest/Investments/src/Domain/Command/DoNothing';
import { WaitForAdminManualAction } from 'Reinvest/Investments/src/Domain/Command/WaitForAdminManualAction';
import { SharesIssuanceFailed } from 'Reinvest/Investments/src/Domain/Events/SharesIssuanceFailed';
import { SharesWereIssued } from 'Reinvest/Investments/src/Domain/Events/SharesWereIssued';
import { SharesIssuanceAwaitingTransaction } from 'Reinvest/Investments/src/Domain/States/SharesIssuanceAwaitingTransaction';
import { TransactionDecision } from 'Reinvest/Investments/src/Domain/TransactionDecision';
import { ManualActionReason } from 'Reinvest/Investments/src/Domain/ValueObject/ManualActionReason';
import { TransactionId } from 'Reinvest/Investments/src/Domain/ValueObject/TransactionId';
import { TransactionState } from 'Reinvest/Investments/src/Domain/ValueObject/TransactionState';

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
