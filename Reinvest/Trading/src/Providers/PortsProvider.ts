import { ContainerInterface } from 'Container/Container';
import { Trading } from 'Trading/index';

export class PortsProvider {
  private config: Trading.Config;

  constructor(config: Trading.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
  }
}
