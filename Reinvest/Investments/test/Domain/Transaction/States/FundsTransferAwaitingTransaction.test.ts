import { expect } from 'chai';
import { Counter } from 'Reinvest/Investments/src/Commons/Counter';
import { DoNothing } from 'Reinvest/Investments/src/Domain/Command/DoNothing';
import { TransferFunds } from 'Reinvest/Investments/src/Domain/Command/TransferFunds';
import { UnwindTrade } from 'Reinvest/Investments/src/Domain/Command/UnwindTrade';
import { WaitForManualAction } from 'Reinvest/Investments/src/Domain/Command/WaitForManualAction';
import { FundsTransferInitializationFailed } from 'Reinvest/Investments/src/Domain/Events/FundsTransferInitializationFailed';
import { FundsTransferInitialized } from 'Reinvest/Investments/src/Domain/Events/FundsTransferInitialized';
import { SubscriptionAgreementSigned } from 'Reinvest/Investments/src/Domain/Events/SubscriptionAgreementSigned';
import {
  FundsTransferAwaitingTransaction,
  NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION,
} from 'Reinvest/Investments/src/Domain/States/FundsTransferAwaitingTransaction';
import { TransactionDecision } from 'Reinvest/Investments/src/Domain/TransactionDecision';
import { FailureCompletionReason } from 'Reinvest/Investments/src/Domain/ValueObject/FailureCompletionReason';
import { TransactionId } from 'Reinvest/Investments/src/Domain/ValueObject/TransactionId';
import { TransactionState } from 'Reinvest/Investments/src/Domain/ValueObject/TransactionState';

context('Given the subscription agreement was signed and awaiting for a funds transfer initialization', () => {
  const transactionId = new TransactionId('123456');
  const transaction = new FundsTransferAwaitingTransaction(transactionId, Counter.init());

  describe('When the system initializes the funds transfer', () => {
    const fundsTransferInitiatedEvent = new FundsTransferInitialized(transactionId);

    it('Then the transaction should do nothing and waits for payment', async () => {
      const decision: TransactionDecision = transaction.execute(fundsTransferInitiatedEvent);

      expect(decision.command).is.instanceof(DoNothing);
      expect(decision.stateChange.status).is.equal(TransactionState.PaymentAwaiting);
    });
  });

  describe('When the funds transfer failed', () => {
    const fundsTransferFailed = new FundsTransferInitializationFailed(transactionId);

    it('Then the transaction should be cancelled', async () => {
      const decision: TransactionDecision = transaction.execute(fundsTransferFailed);

      expect(decision.command).is.instanceof(UnwindTrade);

      expect(decision.stateChange.status).is.equal(TransactionState.TradeUnwindAwaiting);
      expect(decision.stateChange.metadata.unwindReason).is.equal(FailureCompletionReason.FundsTransferInitializationFailed);
    });
  });

  describe('When system re-published a subscription agreement signed event', () => {
    const agreementSigned = new SubscriptionAgreementSigned(transactionId);

    it('Then the transaction should initialize again the transfer funds', async () => {
      const decision: TransactionDecision = transaction.execute(agreementSigned);

      expect(decision.command).is.instanceof(TransferFunds);

      expect(decision.stateChange.status).is.equal(TransactionState.Same);
      expect(decision.stateChange.metadata.numberOfShares).is.undefined;
      expect(decision.stateChange.metadata.unitPrice).is.undefined;
    });

    it('Then if it re-published the event more then max retries then it should request for the manual action', async () => {
      const transaction = new FundsTransferAwaitingTransaction(transactionId, Counter.init(NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION));
      const decision: TransactionDecision = transaction.execute(agreementSigned);

      expect(decision.command).is.instanceof(WaitForManualAction);
      expect(decision.stateChange.status).is.equal(TransactionState.ManualActionAwaiting);
    });
  });
});
