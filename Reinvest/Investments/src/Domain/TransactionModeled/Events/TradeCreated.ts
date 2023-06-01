import { AbstractTransactionEvent } from 'Investments/Domain/TransactionModeled/Events/TransactionEvent';
import { NumberOfShares } from 'Investments/Domain/TransactionModeled/ValueObject/NumberOfShares';
import { TransactionId } from 'Investments/Domain/TransactionModeled/ValueObject/TransactionId';
import { UnitPrice } from 'Investments/Domain/TransactionModeled/ValueObject/UnitPrice';

export class TradeCreated extends AbstractTransactionEvent {
  private readonly _numberOfShares: NumberOfShares;
  private readonly _unitPrice: UnitPrice;

  constructor(transactionId: TransactionId, numberOfShares: NumberOfShares, unitPrice: UnitPrice) {
    super(transactionId);
    this._numberOfShares = numberOfShares;
    this._unitPrice = unitPrice;
  }

  get numberOfShares(): NumberOfShares {
    return this._numberOfShares;
  }

  get unitPrice(): UnitPrice {
    return this._unitPrice;
  }
}
