import { ContainerInterface } from 'Container/Container';
import { TradesRepository } from 'Trading/Adapter/Database/Repository/TradesRepository';
import { Trading } from 'Trading/index';
import { TradingController } from 'Trading/Port/Api/TradingController';

export class PortsProvider {
  private config: Trading.Config;

  constructor(config: Trading.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(TradingController, [TradesRepository]);
  }
}
