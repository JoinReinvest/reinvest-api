import { SignSubscriptionAgreement } from 'Investments/Domain/TransactionModeled/Command/SignSubscriptionAgreement';
import { TransferFunds } from 'Investments/Domain/TransactionModeled/Command/TransferFunds';
import { Counter } from 'Investments/Domain/TransactionModeled/Commons/Counter';
import { SubscriptionAgreementSigned } from 'Investments/Domain/TransactionModeled/Events/SubscriptionAgreementSigned';
import { SubscriptionAgreementSignFailed } from 'Investments/Domain/TransactionModeled/Events/SubscriptionAgreementSignFailed';
import { TradeCreated } from 'Investments/Domain/TransactionModeled/Events/TradeCreated';
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

export class SubscriptionAgreementAwaitingTransaction extends CommonTransaction implements Transaction {
  private readonly signingSubscriptionAgreementCounter: Counter;

  constructor(transactionId: TransactionId, signingSubscriptionAgreementCounter: Counter) {
    super(transactionId);
    this.signingSubscriptionAgreementCounter = signingSubscriptionAgreementCounter;
  }

  public execute(event: TransactionEvent): TransactionDecision {
    super.validateEvent(event);

    switch (true) {
      case event instanceof TradeCreated:
        return this.retrySigningSubscriptionAgreement(event as TradeCreated);
      case event instanceof SubscriptionAgreementSigned:
        return this.initializeFundsTransfer(event as TradeCreated);
      case event instanceof SubscriptionAgreementSignFailed:
        return super.cancelTrade(FailureCompletionReason.CannotSignSubscriptionAgreement);
      case event instanceof TransactionCancelled:
        return this.cancelTrade();
      default:
        return super.execute(event);
    }
  }

  private retrySigningSubscriptionAgreement(event: TradeCreated): TransactionDecision {
    if (this.signingSubscriptionAgreementCounter.isHigherEqualThan(NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION)) {
      return super.waitForAdminManualAction(ManualActionReason.CannotSignSubscriptionAgreement);
    }

    return new TransactionDecision(
      SignSubscriptionAgreement.create(this.transactionId),
      TransactionStateChange.retrySigningSubscriptionAgreementAwaiting(this.transactionId, this.signingSubscriptionAgreementCounter.increment()),
    );
  }

  private initializeFundsTransfer(event: TradeCreated): TransactionDecision {
    return new TransactionDecision(TransferFunds.create(this.transactionId), TransactionStateChange.fundsTransferAwaiting(this.transactionId));
  }
}
