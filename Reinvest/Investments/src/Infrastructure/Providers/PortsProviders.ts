import { ContainerInterface } from 'Container/Container';

import { Investments } from '../..';

export default class PortsProviders {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    console.log('Ports providers boot');
  }
}
