import { ContainerInterface } from 'Container/Container';
import { PortfolioUpdatesRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioUpdatesRepository';
import { Portfolio } from 'Portfolio/index';
import { PortfolioController } from 'Portfolio/Port/Api/PortfolioController';
import { PortfolioUpdatesController } from 'Portfolio/Port/Api/PortfolioUpdatesController';
import { CreatePortfolioUpdate } from 'Portfolio/UseCase/CreatePortfolioUpdate';
import { DeletePortfolioUpdate } from 'Portfolio/UseCase/DeletePortfolioUpdate';
import { GetPortfolioUpdates } from 'Portfolio/UseCase/GetPortfolioUpdates';
import { PortfolioQuery } from 'Portfolio/UseCase/PortfolioQuery';
import { RegisterPortfolio } from 'Portfolio/UseCase/RegisterPortfolio';
import { SynchronizeNav } from 'Portfolio/UseCase/SynchronizeNav';
import SynchronizePortfolio from 'Portfolio/UseCase/SynchronizePortfolio';
import { UpdateProperty } from 'Portfolio/UseCase/UpdateProperty';
import { PortfolioAuthorsController } from 'Portfolio/Port/Api/PortfolioAuthorsController';
import { PortfolioAuthorsRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioAuthors';
import { AddPortfolioAuthor } from 'Portfolio/UseCase/AddPortfolioAuthor';
import { DeletePortfolioAuthor } from 'Portfolio/UseCase/DeletePortfolioAuthor';
import { GetPortfolioAuthors } from 'Portfolio/UseCase/GetPortfolioAuthors';

export class PortsProvider {
  private config: Portfolio.Config;

  constructor(config: Portfolio.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(PortfolioController, [SynchronizePortfolio, UpdateProperty, PortfolioQuery, RegisterPortfolio, SynchronizeNav]);
    container.addSingleton(PortfolioUpdatesController, [PortfolioUpdatesRepository, DeletePortfolioUpdate, CreatePortfolioUpdate, GetPortfolioUpdates]);
    container.addSingleton(PortfolioAuthorsController, [PortfolioAuthorsRepository, AddPortfolioAuthor, DeletePortfolioAuthor, GetPortfolioAuthors]);
  }
}
