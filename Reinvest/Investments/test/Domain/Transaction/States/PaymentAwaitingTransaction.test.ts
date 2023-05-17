import { expect } from 'chai';
import { DoNothing } from 'Investments/Domain/TransactionModeled/Command/DoNothing';
import { UnwindTrade } from 'Investments/Domain/TransactionModeled/Command/UnwindTrade';
import { VerifyInvestor } from 'Investments/Domain/TransactionModeled/Command/VerifyInvestor';
import { FailedPayment } from 'Investments/Domain/TransactionModeled/Events/FailedPayment';
import { FundsTransferInitialized } from 'Investments/Domain/TransactionModeled/Events/FundsTransferInitialized';
import { SuccessfulPayment } from 'Investments/Domain/TransactionModeled/Events/SuccessfulPayment';
import { PaymentAwaitingTransaction } from 'Investments/Domain/TransactionModeled/States/PaymentAwaitingTransaction';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';
import { FailureCompletionReason } from 'Investments/Domain/TransactionModeled/ValueObject/FailureCompletionReason';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';
import { TransactionState } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionState';

context('Given the funds transfer was initiated and awaiting for payment', () => {
  const transactionId = new TransactionId('123456');
  const transaction = new PaymentAwaitingTransaction(transactionId);

  describe('When the system notifies about successful payment', () => {
    const successfulPayment = new SuccessfulPayment(transactionId);

    it('Then the transaction should request account verification and wait for Broker-Dealer approval', async () => {
      const decision: TransactionDecision = transaction.execute(successfulPayment);

      expect(decision.command).is.instanceof(VerifyInvestor);
      expect(decision.stateChange.status).is.equal(TransactionState.VerificationAwaiting);
    });
  });

  describe('When the payment failed', () => {
    const failedPayment = new FailedPayment(transactionId);

    it('Then the transaction should be cancelled', async () => {
      const decision: TransactionDecision = transaction.execute(failedPayment);

      expect(decision.command).is.instanceof(UnwindTrade);

      expect(decision.stateChange.status).is.equal(TransactionState.TradeUnwindAwaiting);
      expect(decision.stateChange.metadata.unwindReason).is.equal(FailureCompletionReason.PaymentFailed);
    });
  });

  describe('When the system re-published the funds transfer initiated event', () => {
    const fundsTransferInitiatedEvent = new FundsTransferInitialized(transactionId);

    it('Then the transaction should do nothing', async () => {
      const decision: TransactionDecision = transaction.execute(fundsTransferInitiatedEvent);

      expect(decision.command).is.instanceof(DoNothing);
      expect(decision.stateChange.status).is.equal(TransactionState.Same);
    });
  });
});
