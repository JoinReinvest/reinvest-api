import { ContainerInterface } from 'Container/Container';
import { SharesAndDividends } from 'SharesAndDividends/index';
import { ConfigurationController } from 'SharesAndDividends/Port/Api/ConfigurationController';
import { DividendsCalculationController } from 'SharesAndDividends/Port/Api/DividendsCalculationController';
import { DividendsController } from 'SharesAndDividends/Port/Api/DividendsController';
import { IncentiveRewardController } from 'SharesAndDividends/Port/Api/IncentiveRewardController';
import { SharesController } from 'SharesAndDividends/Port/Api/SharesController';
import { StatsController } from 'SharesAndDividends/Port/Api/StatsController';
import { AccountStateQuery } from 'SharesAndDividends/UseCase/AccountStateQuery';
import { CalculateDividends } from 'SharesAndDividends/UseCase/CalculateDividends';
import { ChangeSharesState } from 'SharesAndDividends/UseCase/ChangeSharesState';
import CreateConfiguration from 'SharesAndDividends/UseCase/CreateConfiguration';
import { CreateDividendDistribution } from 'SharesAndDividends/UseCase/CreateDividendDistribution';
import { CreateIncentiveReward } from 'SharesAndDividends/UseCase/CreateIncentiveReward';
import { CreateShares } from 'SharesAndDividends/UseCase/CreateShares';
import { DeclareDividend } from 'SharesAndDividends/UseCase/DeclareDividend';
import { DistributeDividends } from 'SharesAndDividends/UseCase/DistributeDividends';
import { DividendsCalculationQuery } from 'SharesAndDividends/UseCase/DividendsCalculationQuery';
import { DividendsListQuery } from 'SharesAndDividends/UseCase/DividendsListQuery';
import { DividendsQuery } from 'SharesAndDividends/UseCase/DividendsQuery';
import { FinishDividendsCalculation } from 'SharesAndDividends/UseCase/FinishDividendsCalculation';
import { FinishDividendsDistribution } from 'SharesAndDividends/UseCase/FinishDividendsDistribution';
import GetConfiguration from 'SharesAndDividends/UseCase/GetConfiguration';
import { MarkDividendAsReinvested } from 'SharesAndDividends/UseCase/MarkDividendAsReinvested';
import { MarkDividendAsWithdrawn } from 'SharesAndDividends/UseCase/MarkDividendAsWithdrawn';
import { StatsQuery } from 'SharesAndDividends/UseCase/StatsQuery';
import { TransferDividends } from 'SharesAndDividends/UseCase/TransferDividends';
import { TransferShares } from 'SharesAndDividends/UseCase/TransferShares';
import { SharesWithdrawing } from 'SharesAndDividends/UseCase/SharesWithdrawing';
import { DividendWithdrawing } from 'SharesAndDividends/UseCase/DividendWithdrawing';

export class PortsProvider {
  private config: SharesAndDividends.Config;

  constructor(config: SharesAndDividends.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // api
    container.addSingleton(SharesController, [CreateShares, ChangeSharesState, AccountStateQuery, TransferShares, SharesWithdrawing]);
    container.addSingleton(StatsController, [StatsQuery]);
    container.addSingleton(IncentiveRewardController, [CreateIncentiveReward]);
    container.addSingleton(DividendsController, [
      DividendsQuery,
      MarkDividendAsReinvested,
      DividendsListQuery,
      MarkDividendAsWithdrawn,
      TransferDividends,
      DividendWithdrawing,
    ]);
    container.addSingleton(DividendsCalculationController, [
      DividendsCalculationQuery,
      DeclareDividend,
      CalculateDividends,
      CreateDividendDistribution,
      DistributeDividends,
      FinishDividendsCalculation,
      FinishDividendsDistribution,
    ]);
    container.addSingleton(ConfigurationController, [CreateConfiguration, GetConfiguration]);
  }
}
