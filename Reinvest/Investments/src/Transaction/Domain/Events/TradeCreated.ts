import { NumberOfShares } from "../ValueObject/NumberOfShares";
import { TransactionId } from "../ValueObject/TransactionId";
import { UnitPrice } from "../ValueObject/UnitPrice";
import { AbstractTransactionEvent } from "./TransactionEvent";

export class TradeCreated extends AbstractTransactionEvent {
  private readonly _numberOfShares: NumberOfShares;
  private readonly _unitPrice: UnitPrice;

  constructor(
    transactionId: TransactionId,
    numberOfShares: NumberOfShares,
    unitPrice: UnitPrice
  ) {
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
