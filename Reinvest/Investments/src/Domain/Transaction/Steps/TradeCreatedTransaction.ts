import {TransactionEvent} from "../Events/TransactionEvent";
import {TradeCreatedEvent} from "../Events/TradeCreatedEvent";
import {TransactionDecision} from "../TransactionDecision";
import {Transaction} from "../Transaction";
import {TransactionStateChange} from "../TransactionStateChange";
import {Wait} from "../Command/Wait";
import {TransactionException} from "../TransactionException";
import {TransactionId} from "../ValueObject/TransactionId";
import {TransferFundsCommand} from "../Command/TransferFundsCommand";
import {FundsTransferInitiatedEvent} from "../Events/FundsTransferInitiatedEvent";
import {Counter} from "../../Commons/Counter";
import {CommonTransaction} from "./CommonTransaction";

const NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION = 3;

export class TradeCreatedTransaction extends CommonTransaction implements Transaction {
    private readonly tradeTriesCounter: Counter;

    constructor(transactionId: TransactionId, tradeTriesCounter: Counter) {
        super(transactionId);
        this.tradeTriesCounter = tradeTriesCounter;
    }

    public execute(event: TransactionEvent): TransactionDecision {
        super.validateEvent(event);

        switch (true) {
            case event instanceof FundsTransferInitiatedEvent:
                return this.noteTheStateAndWait(event as FundsTransferInitiatedEvent);
            case event instanceof TradeCreatedEvent:
                return this.initFundsTransferAgain(event as TradeCreatedEvent);
            default:
                return super.execute(event);
        }
    }

    private noteTheStateAndWait(event: FundsTransferInitiatedEvent): TransactionDecision {
        return new TransactionDecision(
            Wait.create(),
            TransactionStateChange.fundsTransferInitiated(this.transactionId)
        )
    }

    private initFundsTransferAgain(event: TradeCreatedEvent) {
        if (this.tradeTriesCounter.isHigherEqualThan(NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION)) {
            return super.waitForManualAction();
        }

        return new TransactionDecision(
            TransferFundsCommand.create(this.transactionId),
            TransactionStateChange.tradeCreatedRetry(
                this.transactionId,
                this.tradeTriesCounter.increment()
            )
        )
    }
}