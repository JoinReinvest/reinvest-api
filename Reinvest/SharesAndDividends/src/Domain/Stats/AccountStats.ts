import { Money } from 'Money/Money';

export type AccountStatsView = {
  EVS: string;
  accountValue: string;
  accountValueAmount: number;
  advisorFees: string;
  appreciation: string;
  costOfSharesOwned: string;
  currentNAVPerShare: string;
  dividends: string;
  netReturns: string;
  quantityOfShares: string;
};

export class AccountStats {
  public EVS: Money = Money.zero();
  public costOfSharesOwned: Money = Money.zero();
  public quantityOfShares: number = 0.0;
  public currentNAVPerShare: Money = Money.zero();
  private accountValue: Money = Money.zero();
  private netReturns: Money = Money.zero();
  private dividends: Money = Money.zero();
  private appreciation: Money = Money.zero();
  private advisorFees: Money = Money.zero();

  public calculateAppreciation(): this {
    this.appreciation = this.EVS.subtract(this.costOfSharesOwned);

    return this;
  }

  public calculateNetReturns(): this {
    this.netReturns = this.appreciation.add(this.dividends).subtract(this.advisorFees);

    return this;
  }

  public calculateAccountValue(): this {
    this.accountValue = this.EVS.add(this.dividends).subtract(this.advisorFees);

    return this;
  }

  public getAccountStatsView(): AccountStatsView {
    return {
      EVS: this.EVS.getFormattedAmount(),
      accountValue: this.accountValue.getFormattedAmount(),
      accountValueAmount: this.accountValue.getAmount(),
      advisorFees: this.advisorFees.getFormattedAmount(),
      appreciation: this.appreciation.getFormattedAmount(),
      costOfSharesOwned: this.costOfSharesOwned.getFormattedAmount(),
      currentNAVPerShare: this.currentNAVPerShare.getFormattedAmount(),
      dividends: this.dividends.getFormattedAmount(),
      netReturns: this.netReturns.getFormattedAmount(),
      quantityOfShares: this.quantityOfShares.toFixed(2).toString(),
    };
  }

  setEVS(EVS: Money): this {
    this.EVS = EVS;

    return this;
  }

  setCostOfSharesOwned(costOfSharesOwned: Money): this {
    this.costOfSharesOwned = costOfSharesOwned;

    return this;
  }

  setQuantityOfShares(quantityOfShares: number): this {
    this.quantityOfShares = quantityOfShares;

    return this;
  }

  setCurrentNAVPerShare(unitSharePrice: Money) {
    this.currentNAVPerShare = unitSharePrice;

    return this;
  }

  sum(accountStats: AccountStats): AccountStats {
    return new AccountStats()
      .setEVS(this.EVS.add(accountStats.EVS))
      .setCostOfSharesOwned(this.costOfSharesOwned.add(accountStats.costOfSharesOwned))
      .setQuantityOfShares(this.quantityOfShares + accountStats.quantityOfShares)
      .setCurrentNAVPerShare(accountStats.currentNAVPerShare);
  }

  setUnpaidDividends(unpaidDividends: Money): this {
    this.dividends = unpaidDividends;

    return this;
  }

  setUnpaidFees(unpaidFees: Money): this {
    this.advisorFees = unpaidFees;

    return this;
  }
}
