import { ContainerInterface } from 'Container/Container';
import { Portfolio } from 'Portfolio/index';
import { PortfolioController } from 'Portfolio/Port/Api/PortfolioController';

import SynchronizePortfolio from '../UseCase/SynchronizePortfolio';

export class PortsProvider {
  private config: Portfolio.Config;

  constructor(config: Portfolio.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(PortfolioController, [SynchronizePortfolio]);
  }
}
