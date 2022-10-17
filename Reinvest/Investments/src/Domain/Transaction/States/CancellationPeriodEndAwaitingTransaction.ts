import {TransactionEvent} from "../Events/TransactionEvent";
import {TransactionDecision} from "../TransactionDecision";
import {Transaction} from "../Transaction";
import {TransactionStateChange} from "../TransactionStateChange";
import {DoNothing} from "../Command/DoNothing";
import {TransactionId} from "../ValueObject/TransactionId";
import {CommonTransaction} from "./CommonTransaction";
import {FailureCompletionReason} from "../ValueObject/FailureCompletionReason";
import {SuccessfulPayment} from "../Events/SuccessfulPayment";
import {FailedPayment} from "../Events/FailedPayment";
import {CancellationPeriodEnded} from "../Events/CancellationPeriodEnded";
import {IssueShares} from "../Command/IssueShares";
import {TransactionCancelled} from "../Events/TransactionCancelled";

export class CancellationPeriodEndAwaitingTransaction extends CommonTransaction implements Transaction {
    constructor(transactionId: TransactionId) {
        super(transactionId);
    }

    public execute(event: TransactionEvent): TransactionDecision {
        super.validateEvent(event);

        switch (true) {
            case event instanceof CancellationPeriodEnded:
                return this.issueShares(event as CancellationPeriodEnded);
            default:
                return super.execute(event);
        }
    }

    private issueShares(event: CancellationPeriodEnded): TransactionDecision {
        return new TransactionDecision(
            IssueShares.create(),
            TransactionStateChange.sharesIssuanceAwaiting(this.transactionId)
        )
    }
}