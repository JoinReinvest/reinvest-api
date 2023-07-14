import { ContainerInterface } from 'Container/Container';
import { PortfolioRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioRepository';
import { DealpathAdapter } from 'Portfolio/Adapter/Dealpath/DealpathAdapter';
import { Portfolio } from 'Portfolio/index';
import SynchronizePortfolio from 'Portfolio/UseCase/SynchronizePortfolio';
import { UpdateProperty } from 'Portfolio/UseCase/UpdateProperty';
import { DocumentsService } from 'Reinvest/Portfolio/src/Adapter/Documents/DocumentsService';
import { GetProperties } from 'Reinvest/Portfolio/src/UseCase/GetProperties';
import { CreatePortfolioUpdate } from 'Reinvest/Portfolio/src/UseCase/CreatePortfolioUpdate';
import { DeletePortfolioUpdate } from 'Reinvest/Portfolio/src/UseCase/DeletePortfolioUpdate';
import { PortfolioUpdatesRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioUpdatesRepository';
import { GetPortfolioUpdates } from 'Portfolio/UseCase/GetPortfolioUpdates';

export class UseCaseProvider {
  private config: Portfolio.Config;

  constructor(config: Portfolio.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(SynchronizePortfolio, [PortfolioRepository, DealpathAdapter]);
    container.addSingleton(UpdateProperty, [PortfolioRepository]);
    container.addSingleton(GetProperties, [PortfolioRepository, DocumentsService]);
    container.addSingleton(CreatePortfolioUpdate, [PortfolioUpdatesRepository]);
    container.addSingleton(CreatePortfolioUpdate, [PortfolioUpdatesRepository]);
    container.addSingleton(DeletePortfolioUpdate, [PortfolioUpdatesRepository]);
    container.addSingleton(GetPortfolioUpdates, [PortfolioUpdatesRepository]);
  }
}
