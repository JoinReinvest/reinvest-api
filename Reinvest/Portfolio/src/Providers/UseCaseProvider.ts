import { ContainerInterface } from 'Container/Container';
import { PropertyRepository } from 'Portfolio/Adapter/Database/Repository/PropertyRepository';
import { DealpathAdapter } from 'Portfolio/Adapter/Dealpath/DealpathAdapter';
import { Portfolio } from 'Portfolio/index';
import SynchronizePortfolio from 'Portfolio/UseCase/SynchronizePortfolio';
import { UpdateProperty } from 'Portfolio/UseCase/UpdateProperty';
import { DocumentsService } from 'Reinvest/Portfolio/src/Adapter/Documents/DocumentsService';
import { GetProperties } from 'Reinvest/Portfolio/src/UseCase/GetProperties';
import { RegisterPortfolio } from 'Portfolio/UseCase/RegisterPortfolio';
import { PortfolioRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioRepository';
import { PortfolioNorthCapitalAdapter } from 'Portfolio/Adapter/NorthCapital/PortfolioNorthCapitalAdapter';
import { PortfolioVertaloAdapter } from 'Portfolio/Adapter/Vertalo/PortfolioVertaloAdapter';

export class UseCaseProvider {
  private config: Portfolio.Config;

  constructor(config: Portfolio.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(SynchronizePortfolio, [PropertyRepository, DealpathAdapter]);
    container.addSingleton(UpdateProperty, [PropertyRepository]);
    container.addSingleton(GetProperties, [PropertyRepository, DocumentsService]);
    container.addSingleton(RegisterPortfolio, [PortfolioRepository, PortfolioNorthCapitalAdapter, PortfolioVertaloAdapter]);
  }
}
