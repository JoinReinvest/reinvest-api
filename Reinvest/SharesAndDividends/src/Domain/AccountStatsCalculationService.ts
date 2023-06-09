import { Money } from 'Money/Money';
import { AccountStats } from 'SharesAndDividends/Domain/AccountStats';

export type SharesAndTheirPrices = {
  numberOfShares: number | null;
  price: Money;
  unitPrice: Money | null;
};

export type UnpaidDividendsAndFees = {
  dividendAmount: Money;
  feeAmount: Money;
};

export type CurrentNav = {
  numberOfShares: number;
  unitSharePrice: Money;
};

export class AccountStatsCalculationService {
  private readonly shares: SharesAndTheirPrices[];
  private readonly currentNav: CurrentNav;
  private EVS: Money = Money.zero();
  private costOfSharesOwned: Money = Money.zero();
  private quantityOfShares: number = 0.0;

  constructor(currentNav: CurrentNav, shares: SharesAndTheirPrices[]) {
    this.shares = shares;
    this.currentNav = currentNav;
  }

  calculateAccountStats(): AccountStats {
    const accountStats = new AccountStats();
    const { unitSharePrice } = this.currentNav;

    for (const record of this.shares) {
      const { numberOfShares, price } = record;
      this.costOfSharesOwned = this.costOfSharesOwned.add(price);
      const unitEVS = !numberOfShares ? price : unitSharePrice.multiplyBy(numberOfShares);
      this.EVS = this.EVS.add(unitEVS);

      if (numberOfShares) {
        this.quantityOfShares += numberOfShares;
      }
    }

    return accountStats
      .setEVS(this.EVS)
      .setCostOfSharesOwned(this.costOfSharesOwned)
      .setQuantityOfShares(this.quantityOfShares)
      .setCurrentNAVPerShare(unitSharePrice);
  }
}
