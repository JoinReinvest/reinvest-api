import {TransactionEvent} from "../Events/TransactionEvent";
import {TransactionCreated} from "../Events/TransactionCreated";
import {TradeCreatedEvent} from "../Events/TradeCreatedEvent";
import {TransactionDecision} from "../TransactionDecision";
import {Transaction} from "../Transaction";
import {CreateTradeCommand} from "../Command/CreateTradeCommand";
import {TransactionStateChange} from "../TransactionStateChange";
import {TransactionId} from "../ValueObject/TransactionId";
import {TransferFundsCommand} from "../Command/TransferFundsCommand";
import {CommonTransaction} from "./CommonTransaction";

export class NewlyCreatedTransaction extends CommonTransaction implements Transaction {
    constructor(transactionId: TransactionId) {
        super(transactionId);
    }

    public execute(event: TransactionEvent): TransactionDecision {
        super.validateEvent(event);

        switch (true) {
            case event instanceof TransactionCreated:
                return this.createTrade(event as TransactionCreated);
            case event instanceof TradeCreatedEvent:
                return this.initFundsTransfer(event as TradeCreatedEvent);
            default:
                return super.execute(event);
        }
    }

    private createTrade(event: TransactionCreated): TransactionDecision {
        return new TransactionDecision(
            CreateTradeCommand.create(
                this.transactionId,
                event.portfolioId,
                event.investorAccountId,
                event.amountToInvest
            ),
            TransactionStateChange.noChange(this.transactionId)
        )
    }

    private initFundsTransfer(event: TradeCreatedEvent): TransactionDecision {
        return new TransactionDecision(
            TransferFundsCommand.create(this.transactionId),
            TransactionStateChange.tradeCreated(
                this.transactionId,
                event.unitPrice,
                event.numberOfShares
            )
        )
    }
}