import { TransactionCommand } from 'Investments/Domain/TransactionModeled/Command/TransactionCommand';

export class IssueShares implements TransactionCommand {
  transactionCommandGuard = true;

  public static create() {
    return new IssueShares();
  }
}
