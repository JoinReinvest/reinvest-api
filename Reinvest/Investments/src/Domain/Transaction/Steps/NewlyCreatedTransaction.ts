import {TransactionEvent} from "../Events/TransactionEvent";
import {TransactionCreated} from "../Events/TransactionCreated";
import {TradeCreatedEvent} from "../Events/TradeCreatedEvent";
import {TransactionDecision} from "../TransactionDecision";
import {Transaction} from "../Transaction";
import {CreateTradeCommand} from "../Command/CreateTradeCommand";
import {TransactionStateChange} from "../TransactionStateChange";
import {NothingToRun} from "../Command/NothingToRun";

export class NewlyCreatedTransaction implements Transaction {
    transactionGuard: boolean = true;

    public execute(event: TransactionEvent): TransactionDecision {
        switch (true) {
            case event instanceof TransactionCreated:
                return this.createTrade(event as TransactionCreated);
            case event instanceof TradeCreatedEvent:
                break;
            default:
                break;
        }


        return new TransactionDecision(
            NothingToRun.create(),
            TransactionStateChange.noChange()
        )
    }


    private createTrade(event: TransactionCreated): TransactionDecision {
        const commandToExecute = new CreateTradeCommand(
            event.portfolioId,
            event.investorAccountId,
            event.amountToInvest
        );

        return new TransactionDecision(
            commandToExecute,
            TransactionStateChange.noChange()
        )
    }
}