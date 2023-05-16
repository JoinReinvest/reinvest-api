import { expect } from 'chai';
import { DoNothing } from 'Reinvest/Investments/src/Domain/Command/DoNothing';
import { UnwindTrade } from 'Reinvest/Investments/src/Domain/Command/UnwindTrade';
import { VerifyInvestor } from 'Reinvest/Investments/src/Domain/Command/VerifyInvestor';
import { FailedPayment } from 'Reinvest/Investments/src/Domain/Events/FailedPayment';
import { FundsTransferInitialized } from 'Reinvest/Investments/src/Domain/Events/FundsTransferInitialized';
import { SuccessfulPayment } from 'Reinvest/Investments/src/Domain/Events/SuccessfulPayment';
import { PaymentAwaitingTransaction } from 'Reinvest/Investments/src/Domain/States/PaymentAwaitingTransaction';
import { TransactionDecision } from 'Reinvest/Investments/src/Domain/TransactionDecision';
import { FailureCompletionReason } from 'Reinvest/Investments/src/Domain/ValueObject/FailureCompletionReason';
import { TransactionId } from 'Reinvest/Investments/src/Domain/ValueObject/TransactionId';
import { TransactionState } from 'Reinvest/Investments/src/Domain/ValueObject/TransactionState';

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
