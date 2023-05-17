import { Money } from 'Money/Money';

export class UnitPrice {
  private readonly _unitPrice: Money;

  constructor(unitPrice: Money) {
    this._unitPrice = unitPrice;
  }

  get unitPrice(): Money {
    return this._unitPrice;
  }

  static fromMoney(value: Money) {
    return new UnitPrice(value);
  }
}
