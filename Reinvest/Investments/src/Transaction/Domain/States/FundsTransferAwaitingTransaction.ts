import {TransactionEvent} from "../Events/TransactionEvent";
import {TradeCreated} from "../Events/TradeCreated";
import {TransactionDecision} from "../TransactionDecision";
import {Transaction} from "../Transaction";
import {TransactionStateChange} from "../TransactionStateChange";
import {DoNothing} from "../Command/DoNothing";
import {TransactionId} from "../ValueObject/TransactionId";
import {TransferFunds} from "../Command/TransferFunds";
import {FundsTransferInitialized} from "../Events/FundsTransferInitialized";
import {Counter} from "../../../Commons/Counter";
import {CommonTransaction} from "./CommonTransaction";
import {ManualActionReason} from "../ValueObject/ManualActionReason";
import {FundsTransferInitializationFailed} from "../Events/FundsTransferInitializationFailed";
import {FailureCompletionReason} from "../ValueObject/FailureCompletionReason";
import {TransactionCancelled} from "../Events/TransactionCancelled";

export const NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION = 3;

export class FundsTransferAwaitingTransaction extends CommonTransaction implements Transaction {
    private readonly fundsTransferInitializationCounter: Counter;

    constructor(transactionId: TransactionId, tradeTriesCounter: Counter) {
        super(transactionId);
        this.fundsTransferInitializationCounter = tradeTriesCounter;
    }

    public execute(event: TransactionEvent): TransactionDecision {
        super.validateEvent(event);

        switch (true) {
            case event instanceof TradeCreated:
                return this.retryInitializeFundsTransfer(event as TradeCreated);
            case event instanceof FundsTransferInitialized:
                return this.waitForPayment(event as FundsTransferInitialized);
            case event instanceof FundsTransferInitializationFailed:
                return super.completeInvestmentWithFailure(FailureCompletionReason.FundsTransferInitializationFailed);
            case event instanceof TransactionCancelled:
                return this.unwindTrade();
            default:
                return super.execute(event);
        }
    }

    private retryInitializeFundsTransfer(event: TradeCreated) {
        if (this.fundsTransferInitializationCounter.isHigherEqualThan(NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION)) {
            return super.waitForManualAction(ManualActionReason.CannotInitializeFundsTransfer);
        }

        return new TransactionDecision(
            TransferFunds.create(this.transactionId),
            TransactionStateChange.retryFundsTransferAwaiting(
                this.transactionId,
                this.fundsTransferInitializationCounter.increment()
            )
        )
    }

    private waitForPayment(event: FundsTransferInitialized): TransactionDecision {
        return new TransactionDecision(
            DoNothing.create(),
            TransactionStateChange.paymentAwaiting(this.transactionId)
        )
    }
}