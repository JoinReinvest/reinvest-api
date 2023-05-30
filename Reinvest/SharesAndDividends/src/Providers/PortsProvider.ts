import { ContainerInterface } from 'Container/Container';
import { SharesAndDividends } from 'SharesAndDividends/index';
import { DividendsController } from 'SharesAndDividends/Port/Api/DividendsController';
import { IncentiveRewardController } from 'SharesAndDividends/Port/Api/IncentiveRewardController';
import { SharesController } from 'SharesAndDividends/Port/Api/SharesController';
import { StatsController } from 'SharesAndDividends/Port/Api/StatsController';
import { ChangeSharesState } from 'SharesAndDividends/UseCase/ChangeSharesState';
import { CreateIncentiveReward } from 'SharesAndDividends/UseCase/CreateIncentiveReward';
import { CreateShares } from 'SharesAndDividends/UseCase/CreateShares';
import { DividendsQuery } from 'SharesAndDividends/UseCase/DividendsQuery';
import { StatsQuery } from 'SharesAndDividends/UseCase/StatsQuery';

export class PortsProvider {
  private config: SharesAndDividends.Config;

  constructor(config: SharesAndDividends.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(SharesController, [CreateShares, ChangeSharesState]);
    container.addSingleton(StatsController, [StatsQuery]);
    container.addSingleton(IncentiveRewardController, [CreateIncentiveReward]);
    container.addSingleton(DividendsController, [DividendsQuery]);
  }
}
