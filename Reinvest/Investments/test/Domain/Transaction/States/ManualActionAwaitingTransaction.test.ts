import { expect } from 'chai';
import { DoNothing } from 'Investments/Domain/TransactionModeled/Command/DoNothing';
import { ResumeLastEvent } from 'Investments/Domain/TransactionModeled/Command/ResumeLastEvent';
import { UnwindTrade } from 'Investments/Domain/TransactionModeled/Command/UnwindTrade';
import { Counter } from 'Investments/Domain/TransactionModeled/Commons/Counter';
import { TransactionCancelled } from 'Investments/Domain/TransactionModeled/Events/TransactionCancelled';
import { TransactionForcedToQuit } from 'Investments/Domain/TransactionModeled/Events/TransactionForcedToQuit';
import { TransactionResumed } from 'Investments/Domain/TransactionModeled/Events/TransactionResumed';
import { ManualActionAwaitingTransaction } from 'Investments/Domain/TransactionModeled/States/ManualActionAwaitingTransaction';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';
import { FailureCompletionReason } from 'Investments/Domain/TransactionModeled/ValueObject/FailureCompletionReason';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';
import { TransactionState } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionState';
context('Given the transaction is awaiting for manual action', () => {
  const transactionId = new TransactionId('123456');
  const lastTransactionState = TransactionState.PaymentAwaiting;
  const transaction = new ManualActionAwaitingTransaction(transactionId, lastTransactionState);

  describe('When a user resumes the transaction', () => {
    const transactionResumed = new TransactionResumed(transactionId);

    it('Then the transaction should resume the last state', async () => {
      const decision: TransactionDecision = transaction.execute(transactionResumed);

      expect(decision.command).is.instanceof(ResumeLastEvent);
      const command = decision.command as ResumeLastEvent;
      expect(command.state).is.equal(lastTransactionState);

      expect(decision.stateChange.status).is.equal(lastTransactionState);
      const counter = decision.stateChange.metadata.lastActionRetryCounter as Counter;
      expect(counter.isHigherEqualThan(0)).is.true;
    });
  });

  describe('When an admin cancelled the transaction', () => {
    const transactionCancelled = new TransactionCancelled(transactionId);

    it('Then the trade should be unwind', async () => {
      const decision: TransactionDecision = transaction.execute(transactionCancelled);

      expect(decision.command).is.instanceof(UnwindTrade);
      expect(decision.stateChange.status).is.equal(TransactionState.TradeUnwindAwaiting);
    });
  });

  describe('When an admin forced the transaction to quit', () => {
    const transactionForcedToQuit = new TransactionForcedToQuit(transactionId);

    it('Then the transaction should be completed with failure', async () => {
      const decision: TransactionDecision = transaction.execute(transactionForcedToQuit);

      expect(decision.command).is.instanceof(DoNothing);
      expect(decision.stateChange.status).is.equal(TransactionState.CompletedWithFailure);
      expect(decision.stateChange.metadata.failureReason).is.equal(FailureCompletionReason.TransactionForcedManuallyToQuit);
    });
  });
});
