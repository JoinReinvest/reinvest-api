import { TransactionCommand } from "./TransactionCommand";

export class IssueShares implements TransactionCommand {
  transactionCommandGuard = true;

  public static create() {
    return new IssueShares();
  }
}
