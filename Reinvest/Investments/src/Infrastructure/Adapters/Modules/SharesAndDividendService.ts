import { SharesServiceInterface } from 'Investments/Application/DomainEventHandler/SharesServiceInterface';
import { SharesAndDividends } from 'SharesAndDividends/index';
import { DividendDetails } from 'Investments/Domain/Reinvestments/Dividends';

export class SharesAndDividendService implements SharesServiceInterface {
  private sharesAndDividendsModule: SharesAndDividends.Main;

  constructor(sharesAndDividendsModule: SharesAndDividends.Main) {
    this.sharesAndDividendsModule = sharesAndDividendsModule;
  }

  public static getClassName = () => 'SharesAndDividendService';

  async createShares(portfolioId: string, profileId: string, accountId: string, investmentId: string, amount: number): Promise<void> {
    await this.sharesAndDividendsModule.api().createShares(portfolioId, profileId, accountId, investmentId, amount);
  }

  async fundingShares(investmentId: string, shares: number, unitSharePrice: number): Promise<void> {
    await this.sharesAndDividendsModule.api().setSharesToFundingState(investmentId, shares, unitSharePrice);
  }

  async sharesFunded(investmentId: string): Promise<void> {
    await this.sharesAndDividendsModule.api().setSharesToFundedState(investmentId);
  }

  async sharesSettled(investmentId: string): Promise<void> {
    await this.sharesAndDividendsModule.api().setSharesToSettledState(investmentId);
  }

  async getDividend(profileId: string, dividendId: string): Promise<DividendDetails | null> {
    return this.sharesAndDividendsModule.api().getDividend(profileId, dividendId);
  }
}
