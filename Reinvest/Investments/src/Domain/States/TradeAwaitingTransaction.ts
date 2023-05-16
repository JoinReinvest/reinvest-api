import { Counter } from '../../Commons/Counter';
import { CreateTrade } from '../Command/CreateTrade';
import { SignSubscriptionAgreement } from '../Command/SignSubscriptionAgreement';
import { TradeCreated } from '../Events/TradeCreated';
import { TradeFailed } from '../Events/TradeFailed';
import { TransactionCancelled } from '../Events/TransactionCancelled';
import { TransactionCreated } from '../Events/TransactionCreated';
import { TransactionEvent } from '../Events/TransactionEvent';
import { Transaction } from '../Transaction';
import { TransactionDecision } from '../TransactionDecision';
import { TransactionStateChange } from '../TransactionStateChange';
import { ManualActionReason } from '../ValueObject/ManualActionReason';
import { TransactionId } from '../ValueObject/TransactionId';
import { CommonTransaction } from './CommonTransaction';

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
