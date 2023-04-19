import { Currency } from './Currency';

export class Money {
  private amount: number;
  private currency: Currency;

  constructor(amount: number, currency: Currency = Currency.USD) {
    this.amount = amount;
    this.currency = currency;
  }
}
