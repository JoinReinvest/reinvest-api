import { DoNothing } from '../Command/DoNothing';
import { UnwindTrade } from '../Command/UnwindTrade';
import { WaitForAdminManualAction } from '../Command/WaitForAdminManualAction';
import { WaitForManualAction } from '../Command/WaitForManualAction';
import { TransactionEvent } from '../Events/TransactionEvent';
import { Transaction } from '../Transaction';
import { TransactionDecision } from '../TransactionDecision';
import { TransactionException } from '../TransactionException';
import { TransactionStateChange } from '../TransactionStateChange';
import { FailureCompletionReason } from '../ValueObject/FailureCompletionReason';
import { ManualActionReason } from '../ValueObject/ManualActionReason';
import { TransactionId } from '../ValueObject/TransactionId';

export class CommonTransaction implements Transaction {
  transactionGuard = true;
  protected readonly transactionId: TransactionId;

  constructor(transactionId: TransactionId) {
    this.transactionId = transactionId;
  }

  protected validateEvent(event: TransactionEvent): void {
    if (!event.getTransactionId().isEqualTo(this.transactionId)) {
      TransactionException.throw('This event is not for this transaction');
    }
  }

  public execute(event: TransactionEvent): TransactionDecision {
    switch (true) {
      default:
        return this.justWait();
    }
  }

  protected justWait(): TransactionDecision {
    return new TransactionDecision(DoNothing.create(), TransactionStateChange.noChange(this.transactionId));
  }

  protected waitForManualAction(reason: ManualActionReason): TransactionDecision {
    return new TransactionDecision(WaitForManualAction.create(this.transactionId), TransactionStateChange.waitingForManualAction(this.transactionId, reason));
  }

  protected waitForAdminManualAction(reason: ManualActionReason): TransactionDecision {
    return new TransactionDecision(
      WaitForAdminManualAction.create(this.transactionId),
      TransactionStateChange.waitingForAdminManualAction(this.transactionId, reason),
    );
  }

  protected cancelTrade(reason: FailureCompletionReason = FailureCompletionReason.TransactionCancelledManually) {
    return new TransactionDecision(UnwindTrade.create(this.transactionId), TransactionStateChange.tradeUnwindAwaiting(this.transactionId, reason));
  }

  protected completeInvestmentWithFailure(reason: FailureCompletionReason) {
    return new TransactionDecision(DoNothing.create(), TransactionStateChange.completeWithFailure(this.transactionId, reason));
  }
}
