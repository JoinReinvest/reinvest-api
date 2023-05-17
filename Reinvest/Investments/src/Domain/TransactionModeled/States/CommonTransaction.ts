import { DoNothing } from 'Investments/Domain/TransactionModeled/Command/DoNothing';
import { UnwindTrade } from 'Investments/Domain/TransactionModeled/Command/UnwindTrade';
import { WaitForAdminManualAction } from 'Investments/Domain/TransactionModeled/Command/WaitForAdminManualAction';
import { WaitForManualAction } from 'Investments/Domain/TransactionModeled/Command/WaitForManualAction';
import { TransactionEvent } from 'Investments/Domain/TransactionModeled/Events/TransactionEvent';
import { Transaction } from 'Investments/Domain/TransactionModeled/Transaction';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';
import { TransactionException } from 'Investments/Domain/TransactionModeled/TransactionException';
import { TransactionStateChange } from 'Investments/Domain/TransactionModeled/TransactionStateChange';
import { FailureCompletionReason } from 'Investments/Domain/TransactionModeled/ValueObject/FailureCompletionReason';
import { ManualActionReason } from 'Investments/Domain/TransactionModeled/ValueObject/ManualActionReason';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';

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
