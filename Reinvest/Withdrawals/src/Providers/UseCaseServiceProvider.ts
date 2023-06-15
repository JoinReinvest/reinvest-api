import { ContainerInterface } from 'Container/Container';
import { Withdrawals } from 'Withdrawals/index';

export class UseCaseServiceProvider {
  private config: Withdrawals.Config;

  constructor(config: Withdrawals.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {}
}
