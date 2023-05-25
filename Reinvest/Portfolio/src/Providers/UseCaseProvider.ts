import { ContainerInterface } from 'Container/Container';
import { Portfolio } from 'Portfolio/index';

export class UseCaseProvider {
  private config: Portfolio.Config;

  constructor(config: Portfolio.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {}
}
