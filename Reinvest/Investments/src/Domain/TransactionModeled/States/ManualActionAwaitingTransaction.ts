import { ResumeLastEvent } from 'Investments/Domain/TransactionModeled/Command/ResumeLastEvent';
import { TransactionCancelled } from 'Investments/Domain/TransactionModeled/Events/TransactionCancelled';
import { TransactionEvent } from 'Investments/Domain/TransactionModeled/Events/TransactionEvent';
import { TransactionForcedToQuit } from 'Investments/Domain/TransactionModeled/Events/TransactionForcedToQuit';
import { TransactionResumed } from 'Investments/Domain/TransactionModeled/Events/TransactionResumed';
import { CommonTransaction } from 'Investments/Domain/TransactionModeled/States/CommonTransaction';
import { Transaction } from 'Investments/Domain/TransactionModeled/Transaction';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';
import { TransactionStateChange } from 'Investments/Domain/TransactionModeled/TransactionStateChange';
import { FailureCompletionReason } from 'Investments/Domain/TransactionModeled/ValueObject/FailureCompletionReason';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';
import { TransactionState } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionState';

export class ManualActionAwaitingTransaction extends CommonTransaction implements Transaction {
  private readonly lastTransactionState: TransactionState;

  constructor(transactionId: TransactionId, lastTransactionState: TransactionState) {
    super(transactionId);
    this.lastTransactionState = lastTransactionState;
  }

  public execute(event: TransactionEvent): TransactionDecision {
    super.validateEvent(event);

    switch (true) {
      case event instanceof TransactionResumed:
        return this.republishLastEvent();
      case event instanceof TransactionCancelled:
        return this.cancelTrade();
      case event instanceof TransactionForcedToQuit:
        return this.completeInvestmentWithFailure(FailureCompletionReason.TransactionForcedManuallyToQuit);
      default:
        return super.execute(event);
    }
  }

  private republishLastEvent() {
    return new TransactionDecision(
      ResumeLastEvent.create(this.transactionId, this.lastTransactionState),
      TransactionStateChange.changeBackToState(this.transactionId, this.lastTransactionState),
    );
  }
}
