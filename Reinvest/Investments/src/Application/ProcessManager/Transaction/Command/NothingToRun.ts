import {TransactionCommand} from "./TransactionCommand";

export class NothingToRun implements TransactionCommand {
    transactionCommandGuard: boolean = true
}