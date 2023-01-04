import { expect } from "chai";

import { Counter } from "../../../../../src/Commons/Counter";
import { Currency } from "../../../../../src/Commons/Currency";
import { InvestorAccountId } from "../../../../../src/Commons/InvestorAccountId";
import { Money } from "../../../../../src/Commons/Money";
import { PortfolioId } from "../../../../../src/Commons/PortfolioId";
import { CreateTrade } from "../../../../../src/Transaction/Domain/Command/CreateTrade";
import { SignSubscriptionAgreement } from "../../../../../src/Transaction/Domain/Command/SignSubscriptionAgreement";
import { TransferFunds } from "../../../../../src/Transaction/Domain/Command/TransferFunds";
import { UnwindTrade } from "../../../../../src/Transaction/Domain/Command/UnwindTrade";
import { WaitForAdminManualAction } from "../../../../../src/Transaction/Domain/Command/WaitForAdminManualAction";
import { TradeCreated } from "../../../../../src/Transaction/Domain/Events/TradeCreated";
import { TradeFailed } from "../../../../../src/Transaction/Domain/Events/TradeFailed";
import { TransactionCancelled } from "../../../../../src/Transaction/Domain/Events/TransactionCancelled";
import { TransactionCreated } from "../../../../../src/Transaction/Domain/Events/TransactionCreated";
import {
  NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION,
  TradeAwaitingTransaction,
} from "../../../../../src/Transaction/Domain/States/TradeAwaitingTransaction";
import { TransactionDecision } from "../../../../../src/Transaction/Domain/TransactionDecision";
import { ManualActionReason } from "../../../../../src/Transaction/Domain/ValueObject/ManualActionReason";
import { NumberOfShares } from "../../../../../src/Transaction/Domain/ValueObject/NumberOfShares";
import { TransactionId } from "../../../../../src/Transaction/Domain/ValueObject/TransactionId";
import { TransactionState } from "../../../../../src/Transaction/Domain/ValueObject/TransactionState";
import { UnitPrice } from "../../../../../src/Transaction/Domain/ValueObject/UnitPrice";

context("Given the investment was created and awaiting for a trade", () => {
  const transactionId = new TransactionId("123456");
  const transaction = new TradeAwaitingTransaction(
    transactionId,
    Counter.init()
  );

  describe("When the system creates the trade", () => {
    const numberOfShares = new NumberOfShares(1000);
    const unitPrice = UnitPrice.fromMoney(new Money(1.0, Currency.USD));
    const tradeCreated = new TradeCreated(
      transactionId,
      numberOfShares,
      unitPrice
    );

    it("Then the transaction should decide to sign the subscription agreement", async () => {
      const decision: TransactionDecision = transaction.execute(tradeCreated);

      expect(decision.command).is.instanceof(SignSubscriptionAgreement);

      expect(decision.stateChange.status).is.equal(
        TransactionState.SigningSubscriptionAwaiting
      );
      expect(decision.stateChange.metadata.numberOfShares).is.equal(
        numberOfShares
      );
      expect(decision.stateChange.metadata.unitPrice).is.equal(unitPrice);
    });
  });

  describe("When system was not able to create the trade", () => {
    const tradeFailed = new TradeFailed(transactionId);

    it("Then the transaction should decide to wait for manual action", async () => {
      const decision: TransactionDecision = transaction.execute(tradeFailed);

      expect(decision.command).is.instanceof(WaitForAdminManualAction);

      expect(decision.stateChange.status).is.equal(
        TransactionState.AdminManualActionAwaiting
      );
      expect(decision.stateChange.metadata.manualActionReason).is.equal(
        ManualActionReason.TradeCreationFailed
      );
    });
  });

  describe("When system re-published a transaction created event", () => {
    const investorAccountId = new InvestorAccountId("123456");
    const amountToInvest = new Money(1000.0);
    const portfolioId = new PortfolioId("1");
    const theSameButCreatedSomewhereElseTransactionId = new TransactionId(
      "123456"
    );

    const transactionCreated = new TransactionCreated(
      theSameButCreatedSomewhereElseTransactionId,
      portfolioId,
      investorAccountId,
      amountToInvest
    );

    it("Then the transaction should initialize again the trade creation process", async () => {
      const decision: TransactionDecision =
        transaction.execute(transactionCreated);

      expect(decision.command).is.instanceof(CreateTrade);

      expect(decision.stateChange.status).is.equal(TransactionState.Same);
      expect(decision.stateChange.metadata.numberOfShares).is.undefined;
      expect(decision.stateChange.metadata.unitPrice).is.undefined;
    });

    it("Then if it re-published the event more then max retries then it should request for the admin manual action", async () => {
      const transaction = new TradeAwaitingTransaction(
        transactionId,
        Counter.init(NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION)
      );
      const decision: TransactionDecision =
        transaction.execute(transactionCreated);

      expect(decision.command).is.instanceof(WaitForAdminManualAction);
      expect(decision.stateChange.status).is.equal(
        TransactionState.AdminManualActionAwaiting
      );
      expect(decision.stateChange.metadata.manualActionReason).is.equal(
        ManualActionReason.CannotCreateTrade
      );
    });
  });

  describe("When a user cancelled the trade", () => {
    const transactionCancelled = new TransactionCancelled(transactionId);

    it("Then the trade should be unwind", async () => {
      const decision: TransactionDecision =
        transaction.execute(transactionCancelled);

      expect(decision.command).is.instanceof(UnwindTrade);

      expect(decision.stateChange.status).is.equal(
        TransactionState.TradeUnwindAwaiting
      );
    });
  });
});
