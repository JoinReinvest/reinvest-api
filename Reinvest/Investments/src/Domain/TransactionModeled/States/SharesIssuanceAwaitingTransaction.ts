import { DoNothing } from 'Investments/Domain/TransactionModeled/Command/DoNothing';
import { SharesIssuanceFailed } from 'Investments/Domain/TransactionModeled/Events/SharesIssuanceFailed';
import { SharesWereIssued } from 'Investments/Domain/TransactionModeled/Events/SharesWereIssued';
import { TransactionEvent } from 'Investments/Domain/TransactionModeled/Events/TransactionEvent';
import { CommonTransaction } from 'Investments/Domain/TransactionModeled/States/CommonTransaction';
import { Transaction } from 'Investments/Domain/TransactionModeled/Transaction';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';
import { TransactionStateChange } from 'Investments/Domain/TransactionModeled/TransactionStateChange';
import { ManualActionReason } from 'Investments/Domain/TransactionModeled/ValueObject/ManualActionReason';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';

export class SharesIssuanceAwaitingTransaction extends CommonTransaction implements Transaction {
  constructor(transactionId: TransactionId) {
    super(transactionId);
  }

  public execute(event: TransactionEvent): TransactionDecision {
    super.validateEvent(event);

    switch (true) {
      case event instanceof SharesWereIssued:
        return this.completeWithSuccess(event as SharesWereIssued);
      case event instanceof SharesIssuanceFailed:
        return super.waitForAdminManualAction(ManualActionReason.SharesIssuanceFailed);
      default:
        return super.execute(event);
    }
  }

  private completeWithSuccess(event: SharesWereIssued): TransactionDecision {
    return new TransactionDecision(DoNothing.create(), TransactionStateChange.completeWithSuccess(this.transactionId, event.sharesId));
  }
}
