import { expect } from 'chai';
import { Counter } from 'Reinvest/Investments/src/Commons/Counter';
import { Currency } from 'Reinvest/Investments/src/Commons/Currency';
import { Money } from 'Reinvest/Investments/src/Commons/Money';
import { SignSubscriptionAgreement } from 'Reinvest/Investments/src/Domain/Command/SignSubscriptionAgreement';
import { TransferFunds } from 'Reinvest/Investments/src/Domain/Command/TransferFunds';
import { UnwindTrade } from 'Reinvest/Investments/src/Domain/Command/UnwindTrade';
import { WaitForAdminManualAction } from 'Reinvest/Investments/src/Domain/Command/WaitForAdminManualAction';
import { SubscriptionAgreementSigned } from 'Reinvest/Investments/src/Domain/Events/SubscriptionAgreementSigned';
import { SubscriptionAgreementSignFailed } from 'Reinvest/Investments/src/Domain/Events/SubscriptionAgreementSignFailed';
import { TradeCreated } from 'Reinvest/Investments/src/Domain/Events/TradeCreated';
import { SubscriptionAgreementAwaitingTransaction } from 'Reinvest/Investments/src/Domain/States/SubscriptionAgreementAwaitingTransaction';
import { NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION } from 'Reinvest/Investments/src/Domain/States/TradeUnwindAwaitingTransaction';
import { TransactionDecision } from 'Reinvest/Investments/src/Domain/TransactionDecision';
import { FailureCompletionReason } from 'Reinvest/Investments/src/Domain/ValueObject/FailureCompletionReason';
import { NumberOfShares } from 'Reinvest/Investments/src/Domain/ValueObject/NumberOfShares';
import { TransactionId } from 'Reinvest/Investments/src/Domain/ValueObject/TransactionId';
import { TransactionState } from 'Reinvest/Investments/src/Domain/ValueObject/TransactionState';
import { UnitPrice } from 'Reinvest/Investments/src/Domain/ValueObject/UnitPrice';

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
    const unitPrice = UnitPrice.fromMoney(new Money(1.0, Currency.USD));
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
