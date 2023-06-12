import { UUID } from 'HKEKTypes/Generics';
import { Money } from 'Money/Money';
import { CalculatedDividend } from 'SharesAndDividends/Domain/CalculatingDividends/CalculatedDividend';

const CONSTANT_FEE_AMOUNT_IN_CENTS = 500000;

export class InvestorDividendsCalculator {
  static calculateDividend(
    sharesCost: Money,
    partialDividends: CalculatedDividend[],
  ): {
    calculatedDividendsList: { list: UUID[] };
    totalDividendAmount: Money;
    totalFeeAmount: Money;
  } {
    if (partialDividends.length === 0) {
      throw new Error('Cannot calculate dividend for empty partial dividends');
    }

    const calculatedDividends: { list: UUID[] } = { list: [] };
    let totalDividendAmount = Money.zero();
    let regularFeeAmount = Money.zero();
    let maxNumberOfDays = 0;

    for (const partialDividend of partialDividends) {
      const { dividend, fee, numberOfDays, calculatedDividendId } = partialDividend.forCalculatingInvestorDividend();
      totalDividendAmount = totalDividendAmount.add(dividend);
      regularFeeAmount = regularFeeAmount.add(fee);
      maxNumberOfDays = Math.max(maxNumberOfDays, numberOfDays);
      calculatedDividends.list.push(calculatedDividendId);
    }

    const totalFeeAmount = InvestorDividendsCalculator.calculateConstantFee(sharesCost, regularFeeAmount, maxNumberOfDays);

    return {
      calculatedDividendsList: calculatedDividends,
      totalFeeAmount,
      totalDividendAmount,
    };
  }

  private static calculateConstantFee(sharesCost: Money, regularFeeAmount: Money, maxNumberOfDays: number): Money {
    const minAmountForConstantFee = Money.lowPrecision(CONSTANT_FEE_AMOUNT_IN_CENTS);

    if (sharesCost.isGreaterThan(minAmountForConstantFee)) {
      return regularFeeAmount;
    }

    const DAYS_IN_YEAR = 365;
    const ONE_PERCENT = 0.01;

    const onePercentOfPricePerYear = minAmountForConstantFee.increasePrecision().multiplyBy(ONE_PERCENT).divideBy(DAYS_IN_YEAR);

    return onePercentOfPricePerYear.multiplyBy(maxNumberOfDays).decreasePrecision();
  }
}
