import { Money } from 'Money/Money';
import { Portfolio } from 'Portfolio/index';
import { CurrentNav } from 'SharesAndDividends/Domain/Stats/AccountStatsCalculationService';

export class PortfolioService {
  private portfolioModule: Portfolio.Main;

  constructor(portfolioModule: Portfolio.Main) {
    this.portfolioModule = portfolioModule;
  }

  static getClassName = () => 'PortfolioService';

  async getCurrentNav(portfolioId: string): Promise<CurrentNav> {
    const {
      unitNav: { value },
      numberOfShares,
    } = await this.portfolioModule.api().getCurrentNav(portfolioId);

    return <CurrentNav>{
      unitNav: new Money(value),
      numberOfShares: numberOfShares,
    };
  }
}
