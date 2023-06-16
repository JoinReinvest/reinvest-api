import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';

const ONE_PERCENT = 0.01;
const DAYS_IN_YEAR = 365;
const NUMBER_OF_DAYS_WITHOUT_FEE = 5 * DAYS_IN_YEAR;

export type SettledShares = {
  id: UUID;
  numberOfShares: number;
  transactionDate: DateTime;
  unitPrice: Money;
};

export type AwaitingDividends = {
  id: UUID;
  totalDividendAmount: Money;
  totalFeeAmount: Money;
};

export type EligibleWithdrawals = {
  eligibleFunds: Money;
  numberOfShares: number;
  totalDividends: Money;
  totalFee: Money;
  totalFunds: Money;
};

export class WithdrawalsCalculator {
  static calculateEligibleWithdrawals(currentNavPerShare: Money, shares: SettledShares[], dividends: AwaitingDividends[]): EligibleWithdrawals {
    let eligibleFunds = Money.zero();
    let totalNumberOfShares = 0;
    let totalFee = Money.zero();
    let totalFunds = Money.zero();
    let totalDividends = Money.zero();

    for (const share of shares) {
      const { numberOfShares, sharesFee, sharesFundsAmount, sharesEligibleFunds } = this.calculateEligibleFundsForShare(currentNavPerShare, share);

      eligibleFunds = eligibleFunds.add(sharesEligibleFunds);
      totalNumberOfShares += numberOfShares;
      totalFee = totalFee.add(sharesFee);
      totalFunds = totalFunds.add(sharesFundsAmount);
    }

    for (const dividend of dividends) {
      const { totalDividendAmount, totalFeeAmount } = dividend;
      const dividendEligibleFunds = totalDividendAmount.subtract(totalFeeAmount);

      eligibleFunds = eligibleFunds.add(dividendEligibleFunds);
      totalFee = totalFee.add(totalFeeAmount);
      totalDividends = totalDividends.add(totalDividendAmount);
    }

    return {
      eligibleFunds,
      numberOfShares: totalNumberOfShares,
      totalFee,
      totalFunds,
      totalDividends,
    };
  }

  private static calculateEligibleFundsForShare(currentNavPerShare: Money, share: SettledShares) {
    const sharesFee = Money.zero();
    let sharesEligibleFunds = Money.zero();

    const { numberOfShares, transactionDate, unitPrice } = share;
    const unitPriceHighPrecision = unitPrice.increasePrecision();
    const currentNavPerShareHighPrecision = currentNavPerShare.increasePrecision();

    const daysSinceTransaction = transactionDate.numberOfDaysBetween(DateTime.now());
    const sharesFundsAmount = currentNavPerShareHighPrecision.multiplyBy(numberOfShares);

    if (daysSinceTransaction < NUMBER_OF_DAYS_WITHOUT_FEE) {
    } else {
      sharesEligibleFunds = sharesFundsAmount.copy();
    }

    return {
      numberOfShares,
      sharesFee: sharesFee.decreasePrecision(),
      sharesFundsAmount: sharesFundsAmount.decreasePrecision(),
      sharesEligibleFunds: sharesEligibleFunds.decreasePrecision(),
    };
  }
}
