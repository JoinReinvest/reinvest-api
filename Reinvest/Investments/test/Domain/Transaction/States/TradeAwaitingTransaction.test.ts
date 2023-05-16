import { expect } from 'chai';
import { Counter } from 'Reinvest/Investments/src/Commons/Counter';
import { Currency } from 'Reinvest/Investments/src/Commons/Currency';
import { InvestorAccountId } from 'Reinvest/Investments/src/Commons/InvestorAccountId';
import { Money } from 'Reinvest/Investments/src/Commons/Money';
import { PortfolioId } from 'Reinvest/Investments/src/Commons/PortfolioId';
import { CreateTrade } from 'Reinvest/Investments/src/Domain/Command/CreateTrade';
import { SignSubscriptionAgreement } from 'Reinvest/Investments/src/Domain/Command/SignSubscriptionAgreement';
import { UnwindTrade } from 'Reinvest/Investments/src/Domain/Command/UnwindTrade';
import { WaitForAdminManualAction } from 'Reinvest/Investments/src/Domain/Command/WaitForAdminManualAction';
import { TradeCreated } from 'Reinvest/Investments/src/Domain/Events/TradeCreated';
import { TradeFailed } from 'Reinvest/Investments/src/Domain/Events/TradeFailed';
import { TransactionCancelled } from 'Reinvest/Investments/src/Domain/Events/TransactionCancelled';
import { TransactionCreated } from 'Reinvest/Investments/src/Domain/Events/TransactionCreated';
import { NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION, TradeAwaitingTransaction } from 'Reinvest/Investments/src/Domain/States/TradeAwaitingTransaction';
import { TransactionDecision } from 'Reinvest/Investments/src/Domain/TransactionDecision';
import { ManualActionReason } from 'Reinvest/Investments/src/Domain/ValueObject/ManualActionReason';
import { NumberOfShares } from 'Reinvest/Investments/src/Domain/ValueObject/NumberOfShares';
import { TransactionId } from 'Reinvest/Investments/src/Domain/ValueObject/TransactionId';
import { TransactionState } from 'Reinvest/Investments/src/Domain/ValueObject/TransactionState';
import { UnitPrice } from 'Reinvest/Investments/src/Domain/ValueObject/UnitPrice';

context('Given the investment was created and awaiting for a trade', () => {
  const transactionId = new TransactionId('123456');
  const transaction = new TradeAwaitingTransaction(transactionId, Counter.init());

  describe('When the system creates the trade', () => {
    const numberOfShares = new NumberOfShares(1000);
    const unitPrice = UnitPrice.fromMoney(new Money(1.0, Currency.USD));
    const tradeCreated = new TradeCreated(transactionId, numberOfShares, unitPrice);

    it('Then the transaction should decide to sign the subscription agreement', async () => {
      const decision: TransactionDecision = transaction.execute(tradeCreated);

      expect(decision.command).is.instanceof(SignSubscriptionAgreement);

      expect(decision.stateChange.status).is.equal(TransactionState.SigningSubscriptionAwaiting);
      expect(decision.stateChange.metadata.numberOfShares).is.equal(numberOfShares);
      expect(decision.stateChange.metadata.unitPrice).is.equal(unitPrice);
    });
  });

  describe('When system was not able to create the trade', () => {
    const tradeFailed = new TradeFailed(transactionId);

    it('Then the transaction should decide to wait for manual action', async () => {
      const decision: TransactionDecision = transaction.execute(tradeFailed);

      expect(decision.command).is.instanceof(WaitForAdminManualAction);

      expect(decision.stateChange.status).is.equal(TransactionState.AdminManualActionAwaiting);
      expect(decision.stateChange.metadata.manualActionReason).is.equal(ManualActionReason.TradeCreationFailed);
    });
  });

  describe('When system re-published a transaction created event', () => {
    const investorAccountId = new InvestorAccountId('123456');
    const amountToInvest = new Money(1000.0);
    const portfolioId = new PortfolioId('1');
    const theSameButCreatedSomewhereElseTransactionId = new TransactionId('123456');

    const transactionCreated = new TransactionCreated(theSameButCreatedSomewhereElseTransactionId, portfolioId, investorAccountId, amountToInvest);

    it('Then the transaction should initialize again the trade creation process', async () => {
      const decision: TransactionDecision = transaction.execute(transactionCreated);

      expect(decision.command).is.instanceof(CreateTrade);

      expect(decision.stateChange.status).is.equal(TransactionState.Same);
      expect(decision.stateChange.metadata.numberOfShares).is.undefined;
      expect(decision.stateChange.metadata.unitPrice).is.undefined;
    });

    it('Then if it re-published the event more then max retries then it should request for the admin manual action', async () => {
      const transaction = new TradeAwaitingTransaction(transactionId, Counter.init(NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION));
      const decision: TransactionDecision = transaction.execute(transactionCreated);

      expect(decision.command).is.instanceof(WaitForAdminManualAction);
      expect(decision.stateChange.status).is.equal(TransactionState.AdminManualActionAwaiting);
      expect(decision.stateChange.metadata.manualActionReason).is.equal(ManualActionReason.CannotCreateTrade);
    });
  });

  describe('When a user cancelled the trade', () => {
    const transactionCancelled = new TransactionCancelled(transactionId);

    it('Then the trade should be unwind', async () => {
      const decision: TransactionDecision = transaction.execute(transactionCancelled);

      expect(decision.command).is.instanceof(UnwindTrade);

      expect(decision.stateChange.status).is.equal(TransactionState.TradeUnwindAwaiting);
    });
  });
});
