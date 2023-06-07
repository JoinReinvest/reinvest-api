import DineroFactory from 'dinero.js';

export class Money {
  private readonly value: DineroFactory.Dinero;

  constructor(public readonly amount: number, currency: 'USD' = 'USD') {
    this.value = DineroFactory({ amount: this.amount, currency, precision: 2 });
  }

  static zero(): Money {
    return new Money(0);
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

  divideByMoney(divisor: Money): number {
    return this.toUnit() / divisor.toUnit();
  }

  add(addend: Money) {
    const sum = this.value.add(addend.getValue());

    return new Money(sum.getAmount());
  }

  multiply(multiplier: number): Money {
    return new Money(this.value.multiply(multiplier).getAmount());
  }

  subtract(subtrahend: Money): Money {
    return new Money(this.value.subtract(subtrahend.getValue()).getAmount());
  }

  divideBy(numberOfDays: number): Money {
    return new Money(this.value.divide(numberOfDays).getAmount());
  }
}
