import { Money } from 'Money/Money';
import { AccountStats } from 'SharesAndDividends/Domain/Stats/AccountStats';

export type UnpaidDividendsAndFees = {
  dividend: Money;
  fee: Money;
};

export class StatsDividendsCalculationService {
  public static updateAccountStatsForDividendsAndFees(accountStats: AccountStats, dividendsAndFees: UnpaidDividendsAndFees[]): AccountStats {
    let unpaidDividends = Money.zero();
    let unpaidFees = Money.zero();

    for (const { dividend, fee } of dividendsAndFees) {
      unpaidDividends = unpaidDividends.add(dividend);
      unpaidFees = unpaidFees.add(fee);
    }

    return accountStats.setUnpaidDividends(unpaidDividends).setUnpaidFees(unpaidFees);
  }
}
