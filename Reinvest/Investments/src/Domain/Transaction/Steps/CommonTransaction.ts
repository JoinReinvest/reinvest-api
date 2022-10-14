import {TransactionEvent} from "../Events/TransactionEvent";
import {TransactionDecision} from "../TransactionDecision";
import {Transaction} from "../Transaction";
import {TransactionStateChange} from "../TransactionStateChange";
import {Wait} from "../Command/Wait";
import {TransactionException} from "../TransactionException";
import {TransactionId} from "../ValueObject/TransactionId";
import {WaitForManualAction} from "../Command/WaitForManualAction";

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
            // TODO transaction force stop, retry
            default:
                return this.justWait();
        }
    }

    justWait(): TransactionDecision {
        return new TransactionDecision(
            Wait.create(),
            TransactionStateChange.noChange(this.transactionId)
        );
    }

    waitForManualAction(): TransactionDecision {
        return new TransactionDecision(
            WaitForManualAction.create(this.transactionId),
            TransactionStateChange.waitingForManualAction(this.transactionId)
        )
    }
}