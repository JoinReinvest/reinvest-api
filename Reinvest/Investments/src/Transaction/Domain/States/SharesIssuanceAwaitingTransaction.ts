import { DoNothing } from "../Command/DoNothing";
import { SharesIssuanceFailed } from "../Events/SharesIssuanceFailed";
import { SharesWereIssued } from "../Events/SharesWereIssued";
import { TransactionEvent } from "../Events/TransactionEvent";
import { Transaction } from "../Transaction";
import { TransactionDecision } from "../TransactionDecision";
import { TransactionStateChange } from "../TransactionStateChange";
import { ManualActionReason } from "../ValueObject/ManualActionReason";
import { TransactionId } from "../ValueObject/TransactionId";
import { CommonTransaction } from "./CommonTransaction";

export class SharesIssuanceAwaitingTransaction
  extends CommonTransaction
  implements Transaction
{
  constructor(transactionId: TransactionId) {
    super(transactionId);
  }

  public execute(event: TransactionEvent): TransactionDecision {
    super.validateEvent(event);

    switch (true) {
      case event instanceof SharesWereIssued:
        return this.completeWithSuccess(event as SharesWereIssued);
      case event instanceof SharesIssuanceFailed:
        return super.waitForAdminManualAction(
          ManualActionReason.SharesIssuanceFailed
        );
      default:
        return super.execute(event);
    }
  }

  private completeWithSuccess(event: SharesWereIssued): TransactionDecision {
    return new TransactionDecision(
      DoNothing.create(),
      TransactionStateChange.completeWithSuccess(
        this.transactionId,
        event.sharesId
      )
    );
  }
}
