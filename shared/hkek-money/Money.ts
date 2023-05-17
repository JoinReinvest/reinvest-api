import DineroFactory from 'dinero.js';

export class Money {
  private readonly value: DineroFactory.Dinero;

  constructor(public readonly amount: number, currency: 'USD' = 'USD') {
    this.value = DineroFactory({ amount: this.amount, currency, precision: 2 });
  }

  getFormattedAmount(): string {
    return this.value.toFormat('$0,0.00');
  }

  getAmount(): number {
    return this.value.getAmount();
  }
}
