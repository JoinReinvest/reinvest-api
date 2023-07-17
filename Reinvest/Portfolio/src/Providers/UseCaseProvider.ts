import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { PortfolioNavRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioNavRepository';
import { PortfolioRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioRepository';
import { PortfolioUpdatesRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioUpdatesRepository';
import { PropertyRepository } from 'Portfolio/Adapter/Database/Repository/PropertyRepository';
import { DealpathAdapter } from 'Portfolio/Adapter/Dealpath/DealpathAdapter';
import { PortfolioNorthCapitalAdapter } from 'Portfolio/Adapter/NorthCapital/PortfolioNorthCapitalAdapter';
import { PortfolioVertaloAdapter } from 'Portfolio/Adapter/Vertalo/PortfolioVertaloAdapter';
import { Portfolio } from 'Portfolio/index';
import { GetPortfolioUpdates } from 'Portfolio/UseCase/GetPortfolioUpdates';
import { PortfolioQuery } from 'Portfolio/UseCase/PortfolioQuery';
import { RegisterPortfolio } from 'Portfolio/UseCase/RegisterPortfolio';
import { SynchronizeNav } from 'Portfolio/UseCase/SynchronizeNav';
import SynchronizePortfolio from 'Portfolio/UseCase/SynchronizePortfolio';
import { UpdateProperty } from 'Portfolio/UseCase/UpdateProperty';
import { DocumentsService } from 'Reinvest/Portfolio/src/Adapter/Documents/DocumentsService';
import { CreatePortfolioUpdate } from 'Reinvest/Portfolio/src/UseCase/CreatePortfolioUpdate';
import { DeletePortfolioUpdate } from 'Reinvest/Portfolio/src/UseCase/DeletePortfolioUpdate';

export class UseCaseProvider {
  private config: Portfolio.Config;

  constructor(config: Portfolio.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(SynchronizePortfolio, [PropertyRepository, DealpathAdapter]);
    container.addSingleton(UpdateProperty, [PropertyRepository]);
    container.addSingleton(PortfolioQuery, [PortfolioRepository, PortfolioNavRepository, PropertyRepository, DocumentsService]);
    container.addSingleton(SynchronizeNav, [PortfolioNavRepository, PortfolioRepository, PortfolioNorthCapitalAdapter, IdGenerator]);
    container.addSingleton(RegisterPortfolio, [
      PortfolioRepository,
      PortfolioNavRepository,
      PortfolioNorthCapitalAdapter,
      PortfolioVertaloAdapter,
      IdGenerator,
    ]);
    container.addSingleton(CreatePortfolioUpdate, [PortfolioUpdatesRepository]);
    container.addSingleton(CreatePortfolioUpdate, [PortfolioUpdatesRepository, PortfolioRepository]);
    container.addSingleton(DeletePortfolioUpdate, [PortfolioUpdatesRepository]);
    container.addSingleton(GetPortfolioUpdates, [PortfolioUpdatesRepository]);
  }
}
