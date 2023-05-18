import { ContainerInterface } from 'Container/Container';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';
import { Trading } from 'Trading/index';
import { CreateTrade } from 'Trading/IntegrationLogic/UseCase/CreateTrade';

export class IntegrationServiceProvider {
  private config: Trading.Config;

  constructor(config: Trading.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(CreateTrade, [TradingNorthCapitalAdapter]);
  }
}
