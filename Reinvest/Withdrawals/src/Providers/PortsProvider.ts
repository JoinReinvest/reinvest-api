import { ContainerInterface } from 'Container/Container';
import { Withdrawals } from 'Withdrawals/index';
import { WithdrawalsController } from 'Withdrawals/Port/Api/SimulateWithdrawals';
import { CreateWithdrawalFundsRequest } from 'Withdrawals/UseCase/CreateWithdrawalFundsRequest';
import { GetFundsWithdrawalRequest } from 'Withdrawals/UseCase/GetFundsWithdrawalRequest';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';

export class PortsProvider {
  private config: Withdrawals.Config;

  constructor(config: Withdrawals.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(WithdrawalsController, [WithdrawalsQuery, CreateWithdrawalFundsRequest, GetFundsWithdrawalRequest]);
  }
}
