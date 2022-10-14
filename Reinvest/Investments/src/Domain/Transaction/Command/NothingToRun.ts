import {TransactionCommand} from "./TransactionCommand";

export class NothingToRun implements TransactionCommand {
    transactionCommandGuard: boolean = true

    public static create() {
        return new NothingToRun();
    }
}