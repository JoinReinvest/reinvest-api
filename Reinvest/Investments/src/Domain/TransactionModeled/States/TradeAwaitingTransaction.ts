import { CreateTrade } from 'Investments/Domain/TransactionModeled/Command/CreateTrade';
import { SignSubscriptionAgreement } from 'Investments/Domain/TransactionModeled/Command/SignSubscriptionAgreement';
import { Counter } from 'Investments/Domain/TransactionModeled/Commons/Counter';
import { TradeCreated } from 'Investments/Domain/TransactionModeled/Events/TradeCreated';
import { TradeFailed } from 'Investments/Domain/TransactionModeled/Events/TradeFailed';
import { TransactionCancelled } from 'Investments/Domain/TransactionModeled/Events/TransactionCancelled';
import { TransactionCreated } from 'Investments/Domain/TransactionModeled/Events/TransactionCreated';
import { TransactionEvent } from 'Investments/Domain/TransactionModeled/Events/TransactionEvent';
import { CommonTransaction } from 'Investments/Domain/TransactionModeled/States/CommonTransaction';
import { Transaction } from 'Investments/Domain/TransactionModeled/Transaction';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';
import { TransactionStateChange } from 'Investments/Domain/TransactionModeled/TransactionStateChange';
import { ManualActionReason } from 'Investments/Domain/TransactionModeled/ValueObject/ManualActionReason';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';

export const NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION = 5; // ?

export class TradeAwaitingTransaction extends CommonTransaction implements Transaction {
  private readonly tradeCreationCounter: Counter;

  constructor(transactionId: TransactionId, tradeTriesCounter: Counter) {
    super(transactionId);
    this.tradeCreationCounter = tradeTriesCounter;
  }

  public execute(event: TransactionEvent): TransactionDecision {
    super.validateEvent(event);

    switch (true) {
      case event instanceof TransactionCreated:
        return this.retryCreateTrade(event as TransactionCreated);
      case event instanceof TradeCreated:
        return this.signSubscriptionAgreement(event as TradeCreated);
      case event instanceof TradeFailed:
        return super.waitForAdminManualAction(ManualActionReason.TradeCreationFailed);
      case event instanceof TransactionCancelled:
        return this.cancelTrade();
      default:
        return super.execute(event);
    }
  }

  private retryCreateTrade(event: TransactionCreated): TransactionDecision {
    if (this.tradeCreationCounter.isHigherEqualThan(NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION)) {
      return super.waitForAdminManualAction(ManualActionReason.CannotCreateTrade);
    }

    return new TransactionDecision(
      CreateTrade.create(this.transactionId, event.portfolioId, event.investorAccountId, event.amountToInvest),
      TransactionStateChange.retryTradeAwaiting(this.transactionId, this.tradeCreationCounter.increment()),
    );
  }

  private signSubscriptionAgreement(event: TradeCreated): TransactionDecision {
    return new TransactionDecision(
      SignSubscriptionAgreement.create(this.transactionId),
      TransactionStateChange.signingSubscriptionAgreementAwaiting(this.transactionId, event.unitPrice, event.numberOfShares),
    );
  }
}
