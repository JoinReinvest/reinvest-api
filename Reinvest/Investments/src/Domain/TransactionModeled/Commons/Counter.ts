export class Counter {
  private readonly _counter: number;

  constructor(counter: number) {
    this._counter = counter;
  }

  static init(value = 1) {
    return new Counter(value);
  }

  increment() {
    return new Counter(this._counter + 1);
  }

  isHigherEqualThan(value: number) {
    return this._counter >= value;
  }
}
