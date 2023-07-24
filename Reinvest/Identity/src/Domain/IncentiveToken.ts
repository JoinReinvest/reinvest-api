export const INCENTIVE_TOKEN_SIZE = 6;

export class IncentiveToken {
  private incentiveToken: string;

  constructor(incentiveToken: string) {
    if (incentiveToken.length != INCENTIVE_TOKEN_SIZE) {
      throw new Error('Invalid incentive token');
    }

    this.incentiveToken = incentiveToken.toLowerCase();
  }

  get() {
    return this.incentiveToken;
  }
}
