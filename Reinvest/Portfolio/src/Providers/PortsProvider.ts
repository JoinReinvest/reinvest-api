import { ContainerInterface } from 'Container/Container';
import { Portfolio } from 'Portfolio/index';
import { PortfolioController } from 'Portfolio/Port/Api/PortfolioController';
import { GetProperty } from 'Portfolio/UseCase/GetProperty';
import SynchronizePortfolio from 'Portfolio/UseCase/SynchronizePortfolio';
import { UpdateProperty } from 'Portfolio/UseCase/UpdateProperty';

export class PortsProvider {
  private config: Portfolio.Config;

  constructor(config: Portfolio.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(PortfolioController, [SynchronizePortfolio, UpdateProperty, GetProperty]);
  }
}
