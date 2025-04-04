import { UUID } from 'HKEKTypes/Generics';
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
    return this.eligibleWithdrawals.eligibleFunds.isGreaterThan(Money.zero()); // && !this.areThereNotSettledShares; // uncomment it if you want to block withdrawals when there are unsettled shares - in grace period
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

  getEligibleWithdrawalsData() {
    const { accountValue, numberOfShares, totalDividends, totalFee, totalFunds, eligibleFunds } = this.eligibleWithdrawals;

    return {
      accountValue: accountValue.getAmount(),
      numberOfShares,
      totalDividends: totalDividends.getAmount(),
      totalFee: totalFee.getAmount(),
      totalFunds: totalFunds.getAmount(),
      eligibleFunds: eligibleFunds.getAmount(),
    };
  }

  formatAwaitingDividends() {
    return this.awaitingDividends.map(({ id, totalDividendAmount, totalFeeAmount }) => {
      return {
        id,
        totalDividendAmount: totalDividendAmount.getAmount(),
        totalFeeAmount: totalFeeAmount.getAmount(),
      };
    });
  }

  formatSettledShares() {
    return this.settledShares.map(({ id, currentNavPerShare, numberOfShares, transactionDate, unitPrice }) => {
      return {
        id,
        currentNavPerShare: currentNavPerShare.getAmount(),
        numberOfShares: numberOfShares,
        unitPrice: unitPrice.getAmount(),
        transactionDate: transactionDate.toIsoDate(),
      };
    });
  }

  getSettledSharesIds(): UUID[] {
    return this.settledShares.map(({ id }) => id);
  }

  getAwaitingDividendsIds(): UUID[] {
    return this.awaitingDividends.map(({ id }) => id);
  }
}
