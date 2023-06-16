import { ContainerInterface } from 'Container/Container';
import { SharesAndDividendsService } from 'Withdrawals/Adapter/Module/SharesAndDividendsService';
import { Withdrawals } from 'Withdrawals/index';
import { WithdrawalsQuery } from 'Withdrawals/UseCase/WithdrawalsQuery';
import { WithdrawDividend } from 'Withdrawals/UseCase/WithdrawDividend';
import { DividendsRequestsRepository } from 'Withdrawals/Adapter/Database/Repository/DividendsRequestsRepository';
import { IdGenerator } from 'IdGenerator/IdGenerator';

export class UseCaseServiceProvider {
  private config: Withdrawals.Config;

  constructor(config: Withdrawals.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(WithdrawalsQuery, [SharesAndDividendsService]);
    container.addSingleton(WithdrawDividend, [SharesAndDividendsService, DividendsRequestsRepository, 'WithdrawalTransactionalAdapter', IdGenerator]);
  }
}
