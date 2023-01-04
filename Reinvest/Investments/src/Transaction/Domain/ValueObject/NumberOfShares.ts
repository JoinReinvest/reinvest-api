export class NumberOfShares {
  private readonly _numberOfShares: number;

  constructor(numberOfShares: number) {
    this._numberOfShares = numberOfShares;
  }

  get numberOfShares(): number {
    return this._numberOfShares;
  }
}
