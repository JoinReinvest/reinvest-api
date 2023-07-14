import { ContainerInterface } from 'Container/Container';
import { Portfolio } from 'Portfolio/index';
import { PortfolioController } from 'Portfolio/Port/Api/PortfolioController';
import { PortfolioQuery } from 'Portfolio/UseCase/PortfolioQuery';
import { RegisterPortfolio } from 'Portfolio/UseCase/RegisterPortfolio';
import { SynchronizeNav } from 'Portfolio/UseCase/SynchronizeNav';
import SynchronizePortfolio from 'Portfolio/UseCase/SynchronizePortfolio';
import { UpdateProperty } from 'Portfolio/UseCase/UpdateProperty';

export class PortsProvider {
  private config: Portfolio.Config;

  constructor(config: Portfolio.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(PortfolioController, [SynchronizePortfolio, UpdateProperty, PortfolioQuery, RegisterPortfolio, SynchronizeNav]);
  }
}
