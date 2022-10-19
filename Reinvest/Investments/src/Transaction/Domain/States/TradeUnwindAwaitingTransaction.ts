import {TransactionEvent} from "../Events/TransactionEvent";
import {TransactionDecision} from "../TransactionDecision";
import {Transaction} from "../Transaction";
import {TransactionStateChange} from "../TransactionStateChange";
import {TransactionId} from "../ValueObject/TransactionId";
import {Counter} from "../../../Commons/Counter";
import {CommonTransaction} from "./CommonTransaction";
import {ManualActionReason} from "../ValueObject/ManualActionReason";
import {TransactionCancelled} from "../Events/TransactionCancelled";
import {UnwindTrade} from "../Command/UnwindTrade";
import {TradeUnwound} from "../Events/TradeUnwound";
import {FailureCompletionReason} from "../ValueObject/FailureCompletionReason";
import {TradeUnwoundFailed} from "../Events/TradeUnwoundFailed";

export const NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION = 5; // ?

export class TradeUnwindAwaitingTransaction extends CommonTransaction implements Transaction {
    private readonly tradeUnwindCounter: Counter;

    constructor(transactionId: TransactionId, tradeTriesCounter: Counter) {
        super(transactionId);
        this.tradeUnwindCounter = tradeTriesCounter;
    }

    public execute(event: TransactionEvent): TransactionDecision {
        super.validateEvent(event);

        switch (true) {
            case event instanceof TransactionCancelled:
                return this.retryUnwindTrade();
            case event instanceof TradeUnwound:
                return this.completeInvestmentWithFailure(FailureCompletionReason.TransactionCancelled);
            case event instanceof TradeUnwoundFailed:
                return super.waitForAdminManualAction(ManualActionReason.TradeUnwindFailed);
            default:
                return super.execute(event);
        }
    }

    private retryUnwindTrade(): TransactionDecision {
        if (this.tradeUnwindCounter.isHigherEqualThan(NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION)) {
            return super.waitForAdminManualAction(ManualActionReason.CannotInitializeUnwindingProcess);
        }

        return new TransactionDecision(
            UnwindTrade.create(this.transactionId),
            TransactionStateChange.retryTradeUnwindAwaiting(this.transactionId, this.tradeUnwindCounter.increment())
        )
    }
}