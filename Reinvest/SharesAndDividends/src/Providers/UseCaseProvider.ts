import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { FinancialOperationsRepository } from 'SharesAndDividends/Adapter/Database/Repository/FinancialOperationsRepository';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { PortfolioService } from 'SharesAndDividends/Adapter/Modules/PortfolioService';
import { SharesAndDividends } from 'SharesAndDividends/index';
import { ChangeSharesState } from 'SharesAndDividends/UseCase/ChangeSharesState';
import { CreateIncentiveReward } from 'SharesAndDividends/UseCase/CreateIncentiveReward';
import { CreateShares } from 'SharesAndDividends/UseCase/CreateShares';
import { StatsQuery } from 'SharesAndDividends/UseCase/StatsQuery';

export class UseCaseProvider {
  private config: SharesAndDividends.Config;

  constructor(config: SharesAndDividends.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(CreateShares, [SharesRepository, IdGenerator]);
    container.addSingleton(ChangeSharesState, [SharesRepository, IdGenerator, FinancialOperationsRepository, 'SharesAndDividendsTransactionalAdapter']);
    container.addSingleton(StatsQuery, [SharesRepository, PortfolioService, DividendsRepository, FinancialOperationsRepository]);
    container.addSingleton(CreateIncentiveReward, [DividendsRepository, IdGenerator]);
  }
}
