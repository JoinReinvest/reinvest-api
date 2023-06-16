import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { Money } from 'Money/Money';

const ONE_PERCENT = 0.01;
const EIGHTY_PERCENT = 0.8;
const DAYS_IN_YEAR = 365;
const NUMBER_OF_DAYS_WITHOUT_FEE = 5 * DAYS_IN_YEAR;

export type SettledShares = {
  currentNavPerShare: Money;
  id: UUID;
  numberOfShares: number;
  transactionDate: DateTime;
  unitPrice: Money;
};

export type AwaitingDividend = {
  id: UUID;
  totalDividendAmount: Money;
  totalFeeAmount: Money;
};

export type EligibleWithdrawals = {
  accountValue: Money;
  eligibleFunds: Money;
  numberOfShares: number;
  totalDividends: Money;
  totalFee: Money;
  totalFunds: Money;
};

export type WithdrawalsPerShare = {
  numberOfShares: number;
  sharesEligibleFunds: Money;
  sharesFee: Money;
  sharesFundsAmount: Money;
};

export class WithdrawalsCalculator {
  /**
   * WA = SUM(WApT) + SUM(IDpD) - SUM(IAFpD)
   *
   * WA = Withdrawal Amount (here: eligibleFunds)
   * WApT = Withdrawal Amount per Transaction (here: sharesEligibleFunds)
   * IDpD = Investor Dividend per Day (here: totalDividendAmount)
   * IAFpD = Investor Advisory Fee per Day (here: totalFeeAmount)
   */
  static calculateEligibleWithdrawals(shares: SettledShares[], dividends: AwaitingDividend[]): EligibleWithdrawals {
    let eligibleFunds = Money.zero();
    let totalNumberOfShares = 0;
    let totalFee = Money.zero();
    let totalFunds = Money.zero();
    let totalDividends = Money.zero();

    for (const share of shares) {
      const { numberOfShares, sharesFee, sharesFundsAmount, sharesEligibleFunds } = this.calculateEligibleFundsForShare(share);

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

    const accountValue = totalFunds.add(totalDividends);

    return {
      accountValue,
      eligibleFunds,
      numberOfShares: totalNumberOfShares,
      totalFee,
      totalFunds,
      totalDividends,
    };
  }

  /**
   * Calculation formula of withdrawal amount per transaction:
   * WApT = (cNAVpS * 80% - (TRANSACTION_DAYS * 1% / 365) * CSOpS) * SpT
   *
   * WApT - Withdrawal Amount per Transaction [here: sharesEligibleFunds]
   * cNAVpS - current NAV per Share [here: currentNavPerShareHighPrecision]
   * TRANSACTION_DAYS - number of days since transaction [here: daysSinceTransaction]
   * CSOpS - cost of shares per share [here: unitPriceHighPrecision]
   * SpT - Shares per Transaction [here: numberOfShares]
   */
  private static calculateEligibleFundsForShare(share: SettledShares): WithdrawalsPerShare {
    let sharesEligibleFunds: Money;
    let sharesFee = Money.zero();
    const { numberOfShares, transactionDate, unitPrice, currentNavPerShare } = share;
    const unitPriceHighPrecision = unitPrice.increasePrecision();
    const currentNavPerShareHighPrecision = currentNavPerShare.increasePrecision();

    const daysSinceTransaction = DateTime.now().numberOfDaysBetween(transactionDate);
    const sharesFundsAmount = currentNavPerShareHighPrecision.multiplyBy(numberOfShares); // EVS - estimated value of shares

    if (daysSinceTransaction < NUMBER_OF_DAYS_WITHOUT_FEE) {
      const updatedNavPerShare = currentNavPerShareHighPrecision.multiplyBy(EIGHTY_PERCENT); // 80% of current nav per share
      const costOfSharesPerDay = unitPriceHighPrecision.multiplyBy((daysSinceTransaction * ONE_PERCENT) / DAYS_IN_YEAR);
      sharesEligibleFunds = updatedNavPerShare.subtract(costOfSharesPerDay).multiplyBy(numberOfShares);
      sharesFee = sharesFundsAmount.subtract(sharesEligibleFunds);
    } else {
      sharesEligibleFunds = sharesFundsAmount.copy(); // 100% of current nav per share, no fee
    }

    return {
      numberOfShares,
      sharesFee: sharesFee.decreasePrecision(),
      sharesFundsAmount: sharesFundsAmount.decreasePrecision(),
      sharesEligibleFunds: sharesEligibleFunds.decreasePrecision(),
    };
  }
}
