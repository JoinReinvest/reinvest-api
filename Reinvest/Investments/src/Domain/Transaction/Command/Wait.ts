import {TransactionCommand} from "./TransactionCommand";

export class Wait implements TransactionCommand {
    transactionCommandGuard: boolean = true

    public static create() {
        return new Wait();
    }
}