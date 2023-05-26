import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { PortfolioService } from 'SharesAndDividends/Adapter/Modules/PortfolioService';
import { SharesAndDividends } from 'SharesAndDividends/index';
import { ChangeSharesState } from 'SharesAndDividends/UseCase/ChangeSharesState';
import { CreateShares } from 'SharesAndDividends/UseCase/CreateShares';
import { StatsQuery } from 'SharesAndDividends/UseCase/StatsQuery';

export class UseCaseProvider {
  private config: SharesAndDividends.Config;

  constructor(config: SharesAndDividends.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(CreateShares, [SharesRepository, IdGenerator]);
    container.addSingleton(ChangeSharesState, [SharesRepository]);
    container.addSingleton(StatsQuery, [SharesRepository, PortfolioService, DividendsRepository]);
  }
}
