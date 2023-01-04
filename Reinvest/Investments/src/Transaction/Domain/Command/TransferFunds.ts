import { TransactionId } from "../ValueObject/TransactionId";
import { TransactionCommand } from "./TransactionCommand";

export class TransferFunds implements TransactionCommand {
  transactionCommandGuard = true;

  private readonly _transactionId: TransactionId;

  constructor(transactionId: TransactionId) {
    this._transactionId = transactionId;
  }

  static create(transactionId: TransactionId) {
    return new TransferFunds(transactionId);
  }

  get transactionId(): TransactionId {
    return this._transactionId;
  }
}
