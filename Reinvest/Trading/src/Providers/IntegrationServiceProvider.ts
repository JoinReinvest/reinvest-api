import { ContainerInterface } from 'Container/Container';
import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { DocumentService } from 'Trading/Adapter/Module/DocumentService';
import { RegistrationService } from 'Trading/Adapter/Module/RegistrationService';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';
import { TradingVertaloAdapter } from 'Trading/Adapter/Vertalo/TradingVertaloAdapter';
import { Trading } from 'Trading/index';
import { CreateTrade } from 'Trading/IntegrationLogic/UseCase/CreateTrade';

export class IntegrationServiceProvider {
  private config: Trading.Config;

  constructor(config: Trading.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(CreateTrade, [TradesRepository, TradingNorthCapitalAdapter, TradingVertaloAdapter, RegistrationService, DocumentService]);
  }
}
