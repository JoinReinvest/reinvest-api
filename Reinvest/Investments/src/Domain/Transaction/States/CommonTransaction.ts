import {TransactionEvent} from "../Events/TransactionEvent";
import {TransactionDecision} from "../TransactionDecision";
import {Transaction} from "../Transaction";
import {TransactionStateChange} from "../TransactionStateChange";
import {DoNothing} from "../Command/DoNothing";
import {TransactionException} from "../TransactionException";
import {TransactionId} from "../ValueObject/TransactionId";
import {WaitForManualAction} from "../Command/WaitForManualAction";
import {ManualActionReason} from "../ValueObject/ManualActionReason";
import {FailureCompletionReason} from "../ValueObject/FailureCompletionReason";
import {WaitForAdminManualAction} from "../Command/WaitForAdminManualAction";
import {UnwindTrade} from "../Command/UnwindTrade";

export class CommonTransaction implements Transaction {
    transactionGuard: boolean = true;
    protected readonly transactionId: TransactionId;

    constructor(transactionId: TransactionId) {
        this.transactionId = transactionId;
    }

    protected validateEvent(event: TransactionEvent): void {
        if (!event.getTransactionId().isEqualTo(this.transactionId)) {
            TransactionException.throw("This event is not for this transaction");
        }
    }

    public execute(event: TransactionEvent): TransactionDecision {
        switch (true) {
            default:
                return this.justWait();
        }
    }

    protected justWait(): TransactionDecision {
        return new TransactionDecision(
            DoNothing.create(),
            TransactionStateChange.noChange(this.transactionId)
        );
    }

    protected waitForManualAction(reason: ManualActionReason): TransactionDecision {
        return new TransactionDecision(
            WaitForManualAction.create(this.transactionId),
            TransactionStateChange.waitingForManualAction(this.transactionId, reason)
        )
    }

    protected waitForAdminManualAction(reason: ManualActionReason): TransactionDecision {
        return new TransactionDecision(
            WaitForAdminManualAction.create(this.transactionId),
            TransactionStateChange.waitingForAdminManualAction(this.transactionId, reason)
        )
    }

    protected completeInvestmentWithFailure(reason: FailureCompletionReason) {
        return new TransactionDecision(
            DoNothing.create(),
            TransactionStateChange.completeWithFailure(this.transactionId, reason)
        )
    }

    protected unwindTrade() {
        return new TransactionDecision(
            UnwindTrade.create(this.transactionId),
            TransactionStateChange.tradeUnwindAwaiting(this.transactionId)
        )
    }
}