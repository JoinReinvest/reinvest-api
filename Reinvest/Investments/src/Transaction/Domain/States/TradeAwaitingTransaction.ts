import {TransactionEvent} from "../Events/TransactionEvent";
import {TradeCreated} from "../Events/TradeCreated";
import {TransactionDecision} from "../TransactionDecision";
import {Transaction} from "../Transaction";
import {TransactionStateChange} from "../TransactionStateChange";
import {TransactionId} from "../ValueObject/TransactionId";
import {TransferFunds} from "../Command/TransferFunds";
import {Counter} from "../../../Commons/Counter";
import {CommonTransaction} from "./CommonTransaction";
import {TransactionCreated} from "../Events/TransactionCreated";
import {CreateTrade} from "../Command/CreateTrade";
import {TradeFailed} from "../Events/TradeFailed";
import {ManualActionReason} from "../ValueObject/ManualActionReason";
import {TransactionCancelled} from "../Events/TransactionCancelled";

export const NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION = 5; // ?

export class TradeAwaitingTransaction extends CommonTransaction implements Transaction {
    private readonly tradeCreationCounter: Counter;

    constructor(transactionId: TransactionId, tradeTriesCounter: Counter) {
        super(transactionId);
        this.tradeCreationCounter = tradeTriesCounter;
    }

    public execute(event: TransactionEvent): TransactionDecision {
        super.validateEvent(event);

        switch (true) {
            case event instanceof TransactionCreated:
                return this.retryCreateTrade(event as TransactionCreated);
            case event instanceof TradeCreated:
                return this.initializeFundsTransfer(event as TradeCreated);
            case event instanceof TradeFailed:
                return super.waitForAdminManualAction(ManualActionReason.TradeCreationFailed);
            case event instanceof TransactionCancelled:
                return this.unwindTrade();
            default:
                return super.execute(event);
        }
    }

    private retryCreateTrade(event: TransactionCreated): TransactionDecision {
        if (this.tradeCreationCounter.isHigherEqualThan(NUMBER_OF_TRIES_BEFORE_MANUAL_ACTION)) {
            return super.waitForAdminManualAction(ManualActionReason.CannotCreateTrade);
        }

        return new TransactionDecision(
            CreateTrade.create(
                this.transactionId,
                event.portfolioId,
                event.investorAccountId,
                event.amountToInvest
            ),
            TransactionStateChange.retryTradeAwaiting(this.transactionId, this.tradeCreationCounter.increment())
        )
    }

    private initializeFundsTransfer(event: TradeCreated): TransactionDecision {
        return new TransactionDecision(
            TransferFunds.create(this.transactionId),
            TransactionStateChange.fundsTransferAwaiting(
                this.transactionId,
                event.unitPrice,
                event.numberOfShares
            )
        )
    }

}