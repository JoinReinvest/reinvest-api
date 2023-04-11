import { Counter } from '../../../Commons/Counter';
import { DoNothing } from '../Command/DoNothing';
import { TransferFunds } from '../Command/TransferFunds';
import { FundsTransferInitializationFailed } from '../Events/FundsTransferInitializationFailed';
import { FundsTransferInitialized } from '../Events/FundsTransferInitialized';
import { SubscriptionAgreementSigned } from '../Events/SubscriptionAgreementSigned';
import { TransactionCancelled } from '../Events/TransactionCancelled';
import { TransactionEvent } from '../Events/TransactionEvent';
import { Transaction } from '../Transaction';
import { TransactionDecision } from '../TransactionDecision';
import { TransactionStateChange } from '../TransactionStateChange';
import { FailureCompletionReason } from '../ValueObject/FailureCompletionReason';
import { ManualActionReason } from '../ValueObject/ManualActionReason';
import { TransactionId } from '../ValueObject/TransactionId';
import { CommonTransaction } from './CommonTransaction';

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
