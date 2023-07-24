import { expect } from 'chai';
import { SignSubscriptionAgreement } from 'Investments/Domain/TransactionModeled/Command/SignSubscriptionAgreement';
import { TransferFunds } from 'Investments/Domain/TransactionModeled/Command/TransferFunds';
import { UnwindTrade } from 'Investments/Domain/TransactionModeled/Command/UnwindTrade';
import { WaitForAdminManualAction } from 'Investments/Domain/TransactionModeled/Command/WaitForAdminManualAction';
import { Counter } from 'Investments/Domain/TransactionModeled/Commons/Counter';
import { SubscriptionAgreementSigned } from 'Investments/Domain/TransactionModeled/Events/SubscriptionAgreementSigned';
import { SubscriptionAgreementSignFailed } from 'Investments/Domain/TransactionModeled/Events/SubscriptionAgreementSignFailed';
import { TradeCreated } from 'Investments/Domain/TransactionModeled/Events/TradeCreated';
import { SubscriptionAgreementAwaitingTransaction } from 'Investments/Domain/TransactionModeled/States/SubscriptionAgreementAwaitingTransaction';
import { NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION } from 'Investments/Domain/TransactionModeled/States/TradeUnwindAwaitingTransaction';
import { TransactionDecision } from 'Investments/Domain/TransactionModeled/TransactionDecision';
import { FailureCompletionReason } from 'Investments/Domain/TransactionModeled/ValueObject/FailureCompletionReason';
import { NumberOfShares } from 'Investments/Domain/TransactionModeled/ValueObject/NumberOfShares';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';
import { TransactionState } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionState';
import { UnitPrice } from 'Investments/Domain/TransactionModeled/ValueObject/UnitPrice';
import { Money } from 'Money/Money';

context('Given the trade was created and awaiting for a signing the subscription agreement', () => {
  const transactionId = new TransactionId('123456');
  const transaction = new SubscriptionAgreementAwaitingTransaction(transactionId, Counter.init());

  describe('When the subscription agreement was signed', () => {
    const agreementSigned = new SubscriptionAgreementSigned(transactionId);

    it('Then the transaction should initialize the funds transfer', async () => {
      const decision: TransactionDecision = transaction.execute(agreementSigned);

      expect(decision.command).is.instanceof(TransferFunds);
      expect(decision.stateChange.status).is.equal(TransactionState.FundsTransferAwaiting);
    });
  });

  describe('When the subscription agreement failed', () => {
    const agreementSignFailed = new SubscriptionAgreementSignFailed(transactionId);

    it('Then the transaction should be cancelled', async () => {
      const decision: TransactionDecision = transaction.execute(agreementSignFailed);

      expect(decision.command).is.instanceof(UnwindTrade);

      expect(decision.stateChange.status).is.equal(TransactionState.TradeUnwindAwaiting);
      expect(decision.stateChange.metadata.unwindReason).is.equal(FailureCompletionReason.CannotSignSubscriptionAgreement);
    });
  });

  describe('When system re-published a trade created event', () => {
    const numberOfShares = new NumberOfShares(1000);
    const unitPrice = UnitPrice.fromMoney(new Money(100));
    const tradeCreated = new TradeCreated(transactionId, numberOfShares, unitPrice);

    it('Then the transaction should initialize again signing the subscription agreement', async () => {
      const decision: TransactionDecision = transaction.execute(tradeCreated);

      expect(decision.command).is.instanceof(SignSubscriptionAgreement);

      expect(decision.stateChange.status).is.equal(TransactionState.Same);
      expect(decision.stateChange.metadata.numberOfShares).is.undefined;
      expect(decision.stateChange.metadata.unitPrice).is.undefined;
    });

    it('Then if it re-published the event more then max retries then it should request for the manual action', async () => {
      const transaction = new SubscriptionAgreementAwaitingTransaction(transactionId, Counter.init(NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION));
      const decision: TransactionDecision = transaction.execute(tradeCreated);

      expect(decision.command).is.instanceof(WaitForAdminManualAction);
      expect(decision.stateChange.status).is.equal(TransactionState.AdminManualActionAwaiting);
    });
  });
});
