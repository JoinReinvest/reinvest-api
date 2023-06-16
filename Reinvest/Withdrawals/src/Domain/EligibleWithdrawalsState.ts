import { Money } from 'Money/Money';
import { AwaitingDividend, EligibleWithdrawals, SettledShares } from 'Withdrawals/Domain/WithdrawalsCalculator';

export type MoneyAmount = {
  formatted: string;
  value: number;
};

export class EligibleWithdrawalsState {
  private awaitingDividends: AwaitingDividend[];
  private eligibleWithdrawals: EligibleWithdrawals;
  private settledShares: SettledShares[];
  private readonly areThereNotSettledShares: boolean;

  constructor(
    awaitingDividends: AwaitingDividend[],
    eligibleWithdrawals: EligibleWithdrawals,
    settledShares: SettledShares[],
    areThereNotSettledShares: boolean,
  ) {
    this.eligibleWithdrawals = eligibleWithdrawals;
    this.settledShares = settledShares;
    this.awaitingDividends = awaitingDividends;
    this.areThereNotSettledShares = areThereNotSettledShares;
  }

  canWithdraw(): boolean {
    return this.eligibleWithdrawals.eligibleFunds.isGreaterThan(Money.zero()) && !this.areThereNotSettledShares;
  }

  getEligibleForWithdrawalsAmount(): MoneyAmount {
    return {
      value: this.eligibleWithdrawals.eligibleFunds.getAmount(),
      formatted: this.eligibleWithdrawals.eligibleFunds.getFormattedAmount(),
    };
  }

  getAccountValueAmount(): MoneyAmount {
    return {
      value: this.eligibleWithdrawals.accountValue.getAmount(),
      formatted: this.eligibleWithdrawals.accountValue.getFormattedAmount(),
    };
  }

  getPenaltiesFeeAmount(): MoneyAmount {
    return {
      value: this.eligibleWithdrawals.totalFee.getAmount(),
      formatted: this.eligibleWithdrawals.totalFee.getFormattedAmount(),
    };
  }
}
