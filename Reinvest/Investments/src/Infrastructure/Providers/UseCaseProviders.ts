import { ContainerInterface } from 'Container/Container';

import { Investments } from '../..';

export default class UseCaseProviders {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {}
}
