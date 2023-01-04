import { expect } from "chai";

import { Counter } from "../../../../../src/Commons/Counter";
import { DoNothing } from "../../../../../src/Transaction/Domain/Command/DoNothing";
import { UnwindTrade } from "../../../../../src/Transaction/Domain/Command/UnwindTrade";
import { WaitForAdminManualAction } from "../../../../../src/Transaction/Domain/Command/WaitForAdminManualAction";
import { TradeUnwound } from "../../../../../src/Transaction/Domain/Events/TradeUnwound";
import { TradeUnwoundFailed } from "../../../../../src/Transaction/Domain/Events/TradeUnwoundFailed";
import { TransactionCancelled } from "../../../../../src/Transaction/Domain/Events/TransactionCancelled";
import {
  NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION,
  TradeUnwindAwaitingTransaction,
} from "../../../../../src/Transaction/Domain/States/TradeUnwindAwaitingTransaction";
import { TransactionDecision } from "../../../../../src/Transaction/Domain/TransactionDecision";
import { FailureCompletionReason } from "../../../../../src/Transaction/Domain/ValueObject/FailureCompletionReason";
import { ManualActionReason } from "../../../../../src/Transaction/Domain/ValueObject/ManualActionReason";
import { TransactionId } from "../../../../../src/Transaction/Domain/ValueObject/TransactionId";
import { TransactionState } from "../../../../../src/Transaction/Domain/ValueObject/TransactionState";

context(
  "Given the transaction was cancelled and the system is awaiting for trade unwind",
  () => {
    const transactionId = new TransactionId("123456");
    const transaction = new TradeUnwindAwaitingTransaction(
      transactionId,
      Counter.init(),
      FailureCompletionReason.CannotSignSubscriptionAgreement
    );

    describe("When the system unwinds the trade", () => {
      const tradeUnwound = new TradeUnwound(transactionId);

      it("Then the transaction should complete with failure", async () => {
        const decision: TransactionDecision = transaction.execute(tradeUnwound);

        expect(decision.command).is.instanceof(DoNothing);

        expect(decision.stateChange.status).is.equal(
          TransactionState.CompletedWithFailure
        );
        expect(decision.stateChange.metadata.failureReason).is.equal(
          FailureCompletionReason.CannotSignSubscriptionAgreement
        );
      });
    });

    describe("When system was not able to unwind the trade", () => {
      const tradeUnwoundFailed = new TradeUnwoundFailed(transactionId);

      it("Then the transaction should decide to wait for admin manual action", async () => {
        const decision: TransactionDecision =
          transaction.execute(tradeUnwoundFailed);

        expect(decision.command).is.instanceof(WaitForAdminManualAction);

        expect(decision.stateChange.status).is.equal(
          TransactionState.AdminManualActionAwaiting
        );
        expect(decision.stateChange.metadata.manualActionReason).is.equal(
          ManualActionReason.TradeUnwindFailed
        );
      });
    });

    describe("When system re-publishes the transaction cancelled event", () => {
      const transactionCancelled = new TransactionCancelled(transactionId);

      it("Then the transaction should initialize again the trade unwinding process", async () => {
        const decision: TransactionDecision =
          transaction.execute(transactionCancelled);

        expect(decision.command).is.instanceof(UnwindTrade);

        expect(decision.stateChange.status).is.equal(TransactionState.Same);
      });

      it("Then if it re-published the event more then max retries then it should request for the admin manual action", async () => {
        const transaction = new TradeUnwindAwaitingTransaction(
          transactionId,
          Counter.init(NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION),
          FailureCompletionReason.CannotSignSubscriptionAgreement
        );
        const decision: TransactionDecision =
          transaction.execute(transactionCancelled);

        expect(decision.command).is.instanceof(WaitForAdminManualAction);
        expect(decision.stateChange.status).is.equal(
          TransactionState.AdminManualActionAwaiting
        );
        expect(decision.stateChange.metadata.manualActionReason).is.equal(
          ManualActionReason.CannotInitializeUnwindingProcess
        );
      });
    });
  }
);
