import {TransactionCommand} from "./TransactionCommand";

export class IssueShares implements TransactionCommand {
    transactionCommandGuard: boolean = true

    public static create() {
        return new IssueShares();
    }
}