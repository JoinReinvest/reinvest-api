import {TransactionEvent} from "../Events/TransactionEvent";
import {TransactionDecision} from "../TransactionDecision";
import {Transaction} from "../Transaction";
import {TransactionStateChange} from "../TransactionStateChange";
import {DoNothing} from "../Command/DoNothing";
import {TransactionId} from "../ValueObject/TransactionId";
import {CommonTransaction} from "./CommonTransaction";
import {SharesWereIssued} from "../Events/SharesWereIssued";
import {SharesIssuanceFailed} from "../Events/SharesIssuanceFailed";
import {ManualActionReason} from "../ValueObject/ManualActionReason";

export class SharesIssuanceAwaitingTransaction extends CommonTransaction implements Transaction {
    constructor(transactionId: TransactionId) {
        super(transactionId);
    }

    public execute(event: TransactionEvent): TransactionDecision {
        super.validateEvent(event);

        switch (true) {
            case event instanceof SharesWereIssued:
                return this.completeWithSuccess(event as SharesWereIssued);
            case event instanceof SharesIssuanceFailed:
                return super.waitForAdminManualAction(ManualActionReason.SharesIssuanceFailed);
            default:
                return super.execute(event);
        }
    }

    private completeWithSuccess(event: SharesWereIssued): TransactionDecision {
        return new TransactionDecision(
            DoNothing.create(),
            TransactionStateChange.completeWithSuccess(this.transactionId)
        )
    }
}