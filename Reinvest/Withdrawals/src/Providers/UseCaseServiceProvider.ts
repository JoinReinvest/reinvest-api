import { ContainerInterface } from 'Container/Container';
import { SharesAndDividendsService } from 'Withdrawals/Adapter/Module/SharesAndDividendsService';
import { Withdrawals } from 'Withdrawals/index';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';

export class UseCaseServiceProvider {
  private config: Withdrawals.Config;

  constructor(config: Withdrawals.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(WithdrawalsQuery, [SharesAndDividendsService]);
  }
}
