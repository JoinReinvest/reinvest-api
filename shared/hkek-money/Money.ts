import DineroFactory from 'dinero.js';

export class Money {
  private readonly value: DineroFactory.Dinero;

  constructor(public readonly amount: number, currency: 'USD' = 'USD') {
    this.value = DineroFactory({ amount: this.amount, currency, precision: 2 });
  }

  // returns dinero object
  getValue(): DineroFactory.Dinero {
    return this.value;
  }

  getFormattedAmount(): string {
    return this.value.toFormat('$0,0.00');
  }

  // return integer (100 for one dollar)
  getAmount(): number {
    return this.value.getAmount();
  }

  // return float (1.00 for one dollar)
  toUnit(): number {
    return this.value.toUnit();
  }

  divideByAmount(divideBy: Money): number {
    return this.toUnit() / divideBy.toUnit();
  }

  add(value: Money) {
    const sum = this.value.add(value.getValue());

    return new Money(sum.getAmount());
  }
}
