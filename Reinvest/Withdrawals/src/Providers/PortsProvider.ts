import { ContainerInterface } from 'Container/Container';
import { Withdrawals } from 'Withdrawals/index';
import { WithdrawalsController } from 'Withdrawals/Port/Api/WithdrawalsController';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';
import { WithdrawDividend } from 'Withdrawals/UseCase/WithdrawDividend';

export class PortsProvider {
  private config: Withdrawals.Config;

  constructor(config: Withdrawals.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(WithdrawalsController, [WithdrawalsQuery, WithdrawDividend]);
  }
}
