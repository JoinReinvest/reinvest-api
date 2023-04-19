import { expect } from 'chai';

import { Counter } from '../../../../../src/Commons/Counter';
import { DoNothing } from '../../../../../src/Transaction/Domain/Command/DoNothing';
import { TransferFunds } from '../../../../../src/Transaction/Domain/Command/TransferFunds';
import { UnwindTrade } from '../../../../../src/Transaction/Domain/Command/UnwindTrade';
import { WaitForManualAction } from '../../../../../src/Transaction/Domain/Command/WaitForManualAction';
import { FundsTransferInitializationFailed } from '../../../../../src/Transaction/Domain/Events/FundsTransferInitializationFailed';
import { FundsTransferInitialized } from '../../../../../src/Transaction/Domain/Events/FundsTransferInitialized';
import { SubscriptionAgreementSigned } from '../../../../../src/Transaction/Domain/Events/SubscriptionAgreementSigned';
import {
  FundsTransferAwaitingTransaction,
  NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION,
} from '../../../../../src/Transaction/Domain/States/FundsTransferAwaitingTransaction';
import { TransactionDecision } from '../../../../../src/Transaction/Domain/TransactionDecision';
import { FailureCompletionReason } from '../../../../../src/Transaction/Domain/ValueObject/FailureCompletionReason';
import { TransactionId } from '../../../../../src/Transaction/Domain/ValueObject/TransactionId';
import { TransactionState } from '../../../../../src/Transaction/Domain/ValueObject/TransactionState';

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
