import {TransactionCommand} from "./TransactionCommand";

export class DoNothing implements TransactionCommand {
    transactionCommandGuard: boolean = true

    public static create() {
        return new DoNothing();
    }
}