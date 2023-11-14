import { UUID } from 'HKEKTypes/Generics';
import { Money } from 'Money/Money';
import { Portfolio } from 'Portfolio/index';

export class PortfolioService {
  public static getClassName = () => 'PortfolioService';
  private portfolioModule: Portfolio.Main;

  constructor(portfolioModule: Portfolio.Main) {
    this.portfolioModule = portfolioModule;
  }

  async getCurrentSharePrice(portfolioId: UUID): Promise<Money> {
    const {
      unitPrice: { value },
    } = await this.portfolioModule.api().getCurrentUnitPrice(portfolioId);

    return Money.lowPrecision(value);
  }
}
