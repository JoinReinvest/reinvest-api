import { Counter } from "../../../Commons/Counter";
import { SignSubscriptionAgreement } from "../Command/SignSubscriptionAgreement";
import { TransferFunds } from "../Command/TransferFunds";
import { SubscriptionAgreementSigned } from "../Events/SubscriptionAgreementSigned";
import { SubscriptionAgreementSignFailed } from "../Events/SubscriptionAgreementSignFailed";
import { TradeCreated } from "../Events/TradeCreated";
import { TransactionCancelled } from "../Events/TransactionCancelled";
import { TransactionEvent } from "../Events/TransactionEvent";
import { Transaction } from "../Transaction";
import { TransactionDecision } from "../TransactionDecision";
import { TransactionStateChange } from "../TransactionStateChange";
import { FailureCompletionReason } from "../ValueObject/FailureCompletionReason";
import { ManualActionReason } from "../ValueObject/ManualActionReason";
import { TransactionId } from "../ValueObject/TransactionId";
import { CommonTransaction } from "./CommonTransaction";

export const NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION = 5; // ?

export class SubscriptionAgreementAwaitingTransaction
  extends CommonTransaction
  implements Transaction
{
  private readonly signingSubscriptionAgreementCounter: Counter;

  constructor(
    transactionId: TransactionId,
    signingSubscriptionAgreementCounter: Counter
  ) {
    super(transactionId);
    this.signingSubscriptionAgreementCounter =
      signingSubscriptionAgreementCounter;
  }

  public execute(event: TransactionEvent): TransactionDecision {
    super.validateEvent(event);

    switch (true) {
      case event instanceof TradeCreated:
        return this.retrySigningSubscriptionAgreement(event as TradeCreated);
      case event instanceof SubscriptionAgreementSigned:
        return this.initializeFundsTransfer(event as TradeCreated);
      case event instanceof SubscriptionAgreementSignFailed:
        return super.cancelTrade(
          FailureCompletionReason.CannotSignSubscriptionAgreement
        );
      case event instanceof TransactionCancelled:
        return this.cancelTrade();
      default:
        return super.execute(event);
    }
  }

  private retrySigningSubscriptionAgreement(
    event: TradeCreated
  ): TransactionDecision {
    if (
      this.signingSubscriptionAgreementCounter.isHigherEqualThan(
        NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION
      )
    ) {
      return super.waitForAdminManualAction(
        ManualActionReason.CannotSignSubscriptionAgreement
      );
    }

    return new TransactionDecision(
      SignSubscriptionAgreement.create(this.transactionId),
      TransactionStateChange.retrySigningSubscriptionAgreementAwaiting(
        this.transactionId,
        this.signingSubscriptionAgreementCounter.increment()
      )
    );
  }

  private initializeFundsTransfer(event: TradeCreated): TransactionDecision {
    return new TransactionDecision(
      TransferFunds.create(this.transactionId),
      TransactionStateChange.fundsTransferAwaiting(this.transactionId)
    );
  }
}
