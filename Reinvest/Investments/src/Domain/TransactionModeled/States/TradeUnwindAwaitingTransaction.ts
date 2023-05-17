import { UnwindTrade } from 'Investments/Domain/TransactionModeled/Command/UnwindTrade';
import { Counter } from 'Investments/Domain/TransactionModeled/Commons/Counter';
import { TradeUnwound } from 'Investments/Domain/TransactionModeled/Events/TradeUnwound';
import { TradeUnwoundFailed } from 'Investments/Domain/TransactionModeled/Events/TradeUnwoundFailed';
import { TransactionCancelled } from 'Investments/Domain/TransactionModeled/Events/TransactionCancelled';
import { TransactionEvent } from 'Investments/Domain/TransactionModeled/Events/TransactionEvent';
import { CommonTransaction } from 'Investments/Domain/TransactionModeled/States/CommonTransaction';
import { Transaction } from 'Investments/Domain/TransactionModeled/Transaction';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';
import { TransactionStateChange } from 'Investments/Domain/TransactionModeled/TransactionStateChange';
import { FailureCompletionReason } from 'Investments/Domain/TransactionModeled/ValueObject/FailureCompletionReason';
import { ManualActionReason } from 'Investments/Domain/TransactionModeled/ValueObject/ManualActionReason';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';

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
