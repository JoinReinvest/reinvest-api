import { TransactionCommand } from "./TransactionCommand";

export class DoNothing implements TransactionCommand {
  transactionCommandGuard = true;

  public static create() {
    return new DoNothing();
  }
}
