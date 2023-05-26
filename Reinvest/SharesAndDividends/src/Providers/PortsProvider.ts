import { ContainerInterface } from 'Container/Container';
import { SharesAndDividends } from 'SharesAndDividends/index';
import { SharesController } from 'SharesAndDividends/Port/Api/SharesController';
import { CreateShares } from 'SharesAndDividends/UseCase/CreateShares';

export class PortsProvider {
  private config: SharesAndDividends.Config;

  constructor(config: SharesAndDividends.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(SharesController, [CreateShares]);
  }
}
