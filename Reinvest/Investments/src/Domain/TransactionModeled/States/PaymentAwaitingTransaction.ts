import { VerifyInvestor } from 'Investments/Domain/TransactionModeled/Command/VerifyInvestor';
import { FailedPayment } from 'Investments/Domain/TransactionModeled/Events/FailedPayment';
import { SuccessfulPayment } from 'Investments/Domain/TransactionModeled/Events/SuccessfulPayment';
import { TransactionCancelled } from 'Investments/Domain/TransactionModeled/Events/TransactionCancelled';
import { TransactionEvent } from 'Investments/Domain/TransactionModeled/Events/TransactionEvent';
import { CommonTransaction } from 'Investments/Domain/TransactionModeled/States/CommonTransaction';
import { Transaction } from 'Investments/Domain/TransactionModeled/Transaction';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';
import { TransactionStateChange } from 'Investments/Domain/TransactionModeled/TransactionStateChange';
import { FailureCompletionReason } from 'Investments/Domain/TransactionModeled/ValueObject/FailureCompletionReason';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';

export class PaymentAwaitingTransaction extends CommonTransaction implements Transaction {
  constructor(transactionId: TransactionId) {
    super(transactionId);
  }

  public execute(event: TransactionEvent): TransactionDecision {
    super.validateEvent(event);

    switch (true) {
      case event instanceof SuccessfulPayment:
        return this.verifyInvestor(event as SuccessfulPayment);
      case event instanceof FailedPayment:
        return super.cancelTrade(FailureCompletionReason.PaymentFailed);
      case event instanceof TransactionCancelled:
        return this.cancelTrade();
      default:
        return super.execute(event);
    }
  }

  private verifyInvestor(event: SuccessfulPayment): TransactionDecision {
    return new TransactionDecision(VerifyInvestor.create(this.transactionId), TransactionStateChange.verificationAwaiting(this.transactionId));
  }
}
