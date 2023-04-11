import { Counter } from '../../../Commons/Counter';
import { UnwindTrade } from '../Command/UnwindTrade';
import { TradeUnwound } from '../Events/TradeUnwound';
import { TradeUnwoundFailed } from '../Events/TradeUnwoundFailed';
import { TransactionCancelled } from '../Events/TransactionCancelled';
import { TransactionEvent } from '../Events/TransactionEvent';
import { Transaction } from '../Transaction';
import { TransactionDecision } from '../TransactionDecision';
import { TransactionStateChange } from '../TransactionStateChange';
import { FailureCompletionReason } from '../ValueObject/FailureCompletionReason';
import { ManualActionReason } from '../ValueObject/ManualActionReason';
import { TransactionId } from '../ValueObject/TransactionId';
import { CommonTransaction } from './CommonTransaction';

export const NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION = 5; // ?

export class TradeUnwindAwaitingTransaction extends CommonTransaction implements Transaction {
  private readonly tradeUnwindCounter: Counter;
  private readonly unwindReason: FailureCompletionReason;

  constructor(transactionId: TransactionId, tradeTriesCounter: Counter, unwindReason: FailureCompletionReason) {
    super(transactionId);
    this.tradeUnwindCounter = tradeTriesCounter;
    this.unwindReason = unwindReason;
  }

  public execute(event: TransactionEvent): TransactionDecision {
    super.validateEvent(event);

    switch (true) {
      case event instanceof TransactionCancelled:
        return this.retryUnwindTrade();
      case event instanceof TradeUnwound:
        return this.completeInvestmentWithFailure(this.unwindReason);
      case event instanceof TradeUnwoundFailed:
        return super.waitForAdminManualAction(ManualActionReason.TradeUnwindFailed);
      default:
        return super.execute(event);
    }
  }

  private retryUnwindTrade(): TransactionDecision {
    if (this.tradeUnwindCounter.isHigherEqualThan(NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION)) {
      return super.waitForAdminManualAction(ManualActionReason.CannotInitializeUnwindingProcess);
    }

    return new TransactionDecision(
      UnwindTrade.create(this.transactionId),
      TransactionStateChange.retryTradeUnwindAwaiting(this.transactionId, this.tradeUnwindCounter.increment()),
    );
  }
}
