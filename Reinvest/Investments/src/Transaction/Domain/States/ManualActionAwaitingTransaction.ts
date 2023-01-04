import { ResumeLastEvent } from "../Command/ResumeLastEvent";
import { TransactionCancelled } from "../Events/TransactionCancelled";
import { TransactionEvent } from "../Events/TransactionEvent";
import { TransactionForcedToQuit } from "../Events/TransactionForcedToQuit";
import { TransactionResumed } from "../Events/TransactionResumed";
import { Transaction } from "../Transaction";
import { TransactionDecision } from "../TransactionDecision";
import { TransactionStateChange } from "../TransactionStateChange";
import { FailureCompletionReason } from "../ValueObject/FailureCompletionReason";
import { TransactionId } from "../ValueObject/TransactionId";
import { TransactionState } from "../ValueObject/TransactionState";
import { CommonTransaction } from "./CommonTransaction";

export class ManualActionAwaitingTransaction
  extends CommonTransaction
  implements Transaction
{
  private readonly lastTransactionState: TransactionState;

  constructor(
    transactionId: TransactionId,
    lastTransactionState: TransactionState
  ) {
    super(transactionId);
    this.lastTransactionState = lastTransactionState;
  }

  public execute(event: TransactionEvent): TransactionDecision {
    super.validateEvent(event);

    switch (true) {
      case event instanceof TransactionResumed:
        return this.republishLastEvent();
      case event instanceof TransactionCancelled:
        return this.cancelTrade();
      case event instanceof TransactionForcedToQuit:
        return this.completeInvestmentWithFailure(
          FailureCompletionReason.TransactionForcedManuallyToQuit
        );
      default:
        return super.execute(event);
    }
  }

  private republishLastEvent() {
    return new TransactionDecision(
      ResumeLastEvent.create(this.transactionId, this.lastTransactionState),
      TransactionStateChange.changeBackToState(
        this.transactionId,
        this.lastTransactionState
      )
    );
  }
}
