import { Money } from 'Money/Money';
import { Portfolio } from 'Portfolio/index';
import { CurrentNav } from 'SharesAndDividends/Domain/AccountStatsCalculationService';

export class PortfolioService {
  private portfolioModule: Portfolio.Main;

  constructor(portfolioModule: Portfolio.Main) {
    this.portfolioModule = portfolioModule;
  }

  static getClassName = () => 'PortfolioService';

  async getCurrentNav(portfolioId: string): Promise<CurrentNav> {
    const { unitSharePrice, numberOfShares } = await this.portfolioModule.api().getCurrentNav(portfolioId);

    return <CurrentNav>{
      unitSharePrice: new Money(unitSharePrice),
      numberOfShares: numberOfShares,
    };
  }
}
