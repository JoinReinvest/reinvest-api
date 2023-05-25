import { ContainerInterface } from 'Container/Container';
import { SharesAndDividends } from 'SharesAndDividends/index';

export class UseCaseProvider {
  private config: SharesAndDividends.Config;

  constructor(config: SharesAndDividends.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {}
}
