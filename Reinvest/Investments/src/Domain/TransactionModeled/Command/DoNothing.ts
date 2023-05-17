import { TransactionCommand } from 'Investments/Domain/TransactionModeled/Command/TransactionCommand';

export class DoNothing implements TransactionCommand {
  transactionCommandGuard = true;

  public static create() {
    return new DoNothing();
  }
}
