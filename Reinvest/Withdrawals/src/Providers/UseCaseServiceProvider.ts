import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { FundsRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/FundsRequestsRepository';
import { SharesAndDividendsService } from 'Withdrawals/Adapter/Module/SharesAndDividendsService';
import { Withdrawals } from 'Withdrawals/index';
import { CreateWithdrawalFundsRequest } from 'Withdrawals/UseCase/CreateWithdrawalFundsRequest';
import { GetFundsWithdrawalRequest } from 'Withdrawals/UseCase/GetFundsWithdrawalRequest';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';

export class UseCaseServiceProvider {
  private config: Withdrawals.Config;

  constructor(config: Withdrawals.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);

    container.addSingleton(WithdrawalsQuery, [SharesAndDividendsService]);
    container.addSingleton(CreateWithdrawalFundsRequest, [IdGenerator, FundsRequestsRepository, WithdrawalsQuery]);
    container.addSingleton(GetFundsWithdrawalRequest, [FundsRequestsRepository, WithdrawalsQuery]);
  }
}
