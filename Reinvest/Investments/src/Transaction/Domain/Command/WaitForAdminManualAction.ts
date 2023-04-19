import { TransactionId } from '../ValueObject/TransactionId';
import { TransactionCommand } from './TransactionCommand';

export class WaitForAdminManualAction implements TransactionCommand {
  transactionCommandGuard = true;

  private readonly _transactionId: TransactionId;

  constructor(transactionId: TransactionId) {
    this._transactionId = transactionId;
  }

  static create(transactionId: TransactionId) {
    return new WaitForAdminManualAction(transactionId);
  }

  get transactionId(): TransactionId {
    return this._transactionId;
  }
}
