import { TransactionCommand } from 'Investments/Domain/TransactionModeled/Command/TransactionCommand';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';

export class SignSubscriptionAgreement implements TransactionCommand {
  transactionCommandGuard = true;

  private readonly _transactionId: TransactionId;

  constructor(transactionId: TransactionId) {
    this._transactionId = transactionId;
  }

  static create(transactionId: TransactionId) {
    return new SignSubscriptionAgreement(transactionId);
  }

  get transactionId(): TransactionId {
    return this._transactionId;
  }
}
