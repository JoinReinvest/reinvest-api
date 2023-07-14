import { ContainerInterface } from 'Container/Container';
import { Portfolio } from 'Portfolio/index';
import { PortfolioController } from 'Portfolio/Port/Api/PortfolioController';
import { PortfolioUpdatesController } from 'Portfolio/Port/Api/PortfolioUpdatesController';
import SynchronizePortfolio from 'Portfolio/UseCase/SynchronizePortfolio';
import { UpdateProperty } from 'Portfolio/UseCase/UpdateProperty';
import { GetProperties } from 'Reinvest/Portfolio/src/UseCase/GetProperties';
import { PortfolioUpdatesRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioUpdatesRepository';
import { DeletePortfolioUpdate } from 'Portfolio/UseCase/DeletePortfolioUpdate';
import { CreatePortfolioUpdate } from 'Portfolio/UseCase/CreatePortfolioUpdate';
import {GetPortfolioUpdates} from "Portfolio/UseCase/GetPortfolioUpdates";

export class PortsProvider {
  private config: Portfolio.Config;

  constructor(config: Portfolio.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(PortfolioController, [SynchronizePortfolio, UpdateProperty, GetProperties]);
    container.addSingleton(PortfolioUpdatesController, [PortfolioUpdatesRepository, DeletePortfolioUpdate, CreatePortfolioUpdate, GetPortfolioUpdates]);
  }
}
