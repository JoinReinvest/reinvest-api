import { DoNothing } from 'Investments/Domain/TransactionModeled/Command/DoNothing';
import { TransferFunds } from 'Investments/Domain/TransactionModeled/Command/TransferFunds';
import { Counter } from 'Investments/Domain/TransactionModeled/Commons/Counter';
import { FundsTransferInitializationFailed } from 'Investments/Domain/TransactionModeled/Events/FundsTransferInitializationFailed';
import { FundsTransferInitialized } from 'Investments/Domain/TransactionModeled/Events/FundsTransferInitialized';
import { SubscriptionAgreementSigned } from 'Investments/Domain/TransactionModeled/Events/SubscriptionAgreementSigned';
import { TransactionCancelled } from 'Investments/Domain/TransactionModeled/Events/TransactionCancelled';
import { TransactionEvent } from 'Investments/Domain/TransactionModeled/Events/TransactionEvent';
import { CommonTransaction } from 'Investments/Domain/TransactionModeled/States/CommonTransaction';
import { Transaction } from 'Investments/Domain/TransactionModeled/Transaction';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';
import { TransactionStateChange } from 'Investments/Domain/TransactionModeled/TransactionStateChange';
import { FailureCompletionReason } from 'Investments/Domain/TransactionModeled/ValueObject/FailureCompletionReason';
import { ManualActionReason } from 'Investments/Domain/TransactionModeled/ValueObject/ManualActionReason';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';

export const NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION = 3;

export class FundsTransferAwaitingTransaction extends CommonTransaction implements Transaction {
  private readonly fundsTransferInitializationCounter: Counter;

  constructor(transactionId: TransactionId, tradeTriesCounter: Counter) {
    super(transactionId);
    this.fundsTransferInitializationCounter = tradeTriesCounter;
  }

  public execute(event: TransactionEvent): TransactionDecision {
    super.validateEvent(event);

    switch (true) {
      case event instanceof SubscriptionAgreementSigned:
        return this.retryInitializeFundsTransfer(event as SubscriptionAgreementSigned);
      case event instanceof FundsTransferInitialized:
        return this.waitForPayment(event as FundsTransferInitialized);
      case event instanceof FundsTransferInitializationFailed:
        return super.cancelTrade(FailureCompletionReason.FundsTransferInitializationFailed);
      case event instanceof TransactionCancelled:
        return this.cancelTrade();
      default:
        return super.execute(event);
    }
  }

  private retryInitializeFundsTransfer(event: SubscriptionAgreementSigned) {
    if (this.fundsTransferInitializationCounter.isHigherEqualThan(NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION)) {
      return super.waitForManualAction(ManualActionReason.CannotInitializeFundsTransfer);
    }

    return new TransactionDecision(
      TransferFunds.create(this.transactionId),
      TransactionStateChange.retryFundsTransferAwaiting(this.transactionId, this.fundsTransferInitializationCounter.increment()),
    );
  }

  private waitForPayment(event: FundsTransferInitialized): TransactionDecision {
    return new TransactionDecision(DoNothing.create(), TransactionStateChange.paymentAwaiting(this.transactionId));
  }
}
