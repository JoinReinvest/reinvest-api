import { SharesId } from 'Investments/Domain/TransactionModeled/Commons/SharesId';
import { AbstractTransactionEvent } from 'Investments/Domain/TransactionModeled/Events/TransactionEvent';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';

export class SharesWereIssued extends AbstractTransactionEvent {
  private readonly _sharesId: SharesId;

  constructor(transactionId: TransactionId, sharesId: SharesId) {
    super(transactionId);
    this._sharesId = sharesId;
  }

  get sharesId(): SharesId {
    return this._sharesId;
  }
}
