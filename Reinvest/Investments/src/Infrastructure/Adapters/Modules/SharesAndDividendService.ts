import { SharesServiceInterface } from 'Investments/Application/DomainEventHandler/SharesServiceInterface';
import { SharesAndDividends } from 'SharesAndDividends/index';

export class SharesAndDividendService implements SharesServiceInterface {
  private sharesAndDividendsModule: SharesAndDividends.Main;

  constructor(sharesAndDividendsModule: SharesAndDividends.Main) {
    this.sharesAndDividendsModule = sharesAndDividendsModule;
  }

  public static getClassName = () => 'SharesAndDividendService';

  async createShares(portfolioId: string, profileId: string, accountId: string, investmentId: string, amount: number): Promise<void> {
    await this.sharesAndDividendsModule.api().createShares(portfolioId, profileId, accountId, investmentId, amount);
  }
}
