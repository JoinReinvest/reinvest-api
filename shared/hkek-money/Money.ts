import DineroFactory from 'dinero.js';

enum PRECISION {
  LOW = 2,
  HIGH = 8,
}

enum CURRENCY {
  USD = 'USD',
}

export class Money {
  private readonly value: DineroFactory.Dinero;
  private readonly precision: PRECISION;
  private readonly currency: CURRENCY;

  // default precision is low, so we must provide value in cents, ie 100 for one dollar
  constructor(public readonly amount: number, currency: CURRENCY = CURRENCY.USD, precision: PRECISION = PRECISION.LOW) {
    this.value = DineroFactory({ amount: this.amount, currency, precision });
    this.precision = precision;
    this.currency = currency;
  }

  static zero(): Money {
    return new Money(0);
  }

  // for high precision multiplyBy a value in cents (so 10^2) by 10^6 (ie $1.00 from 100 becomes 100 000 000)
  static highPrecision(amount: number): Money {
    return new Money(amount, CURRENCY.USD, PRECISION.HIGH);
  }

  static lowPrecision(amount: number): Money {
    return new Money(amount, CURRENCY.USD, PRECISION.LOW);
  }

  increasePrecision(): Money {
    if (this.precision === PRECISION.HIGH) {
      return this;
    }

    const higherPrecisionAmount = this.value.convertPrecision(PRECISION.HIGH).getAmount();

    return new Money(higherPrecisionAmount, this.currency, PRECISION.HIGH);
  }

  decreasePrecision(): Money {
    if (this.precision === PRECISION.LOW) {
      return this;
    }

    const lowerPrecisionAmount = this.value.convertPrecision(PRECISION.LOW).getAmount();

    return new Money(lowerPrecisionAmount);
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

    return new Money(sum.getAmount(), this.currency, this.precision);
  }

  multiplyBy(multiplier: number): Money {
    return new Money(this.value.multiply(multiplier).getAmount(), this.currency, this.precision);
  }

  subtract(subtrahend: Money): Money {
    return new Money(this.value.subtract(subtrahend.getValue()).getAmount(), this.currency, this.precision);
  }

  divideBy(divisor: number): Money {
    return new Money(this.value.divide(divisor).getAmount(), this.currency, this.precision);
  }
}
