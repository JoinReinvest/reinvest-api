import { ContainerInterface } from 'Container/Container';
import { DividendsController } from 'SharesAndDividends/Port/Api/DividendsController';
import { IncentiveRewardController } from 'SharesAndDividends/Port/Api/IncentiveRewardController';
import { SharesController } from 'SharesAndDividends/Port/Api/SharesController';
import { StatsController } from 'SharesAndDividends/Port/Api/StatsController';

export type SharesAndDividendsApiType = {
  createManuallyIncentiveReward: IncentiveRewardController['createManuallyIncentiveReward'];
  createShares: SharesController['createShares'];
  declareDividend: DividendsController['declareDividend'];
  getAccountStats: StatsController['getAccountStats'];
  getDividend: DividendsController['getDividend'];
  getDividendDeclarationByDate: DividendsController['getDividendDeclarationByDate'];
  getDividendDeclarations: DividendsController['getDividendDeclarations'];
  getEVSChart: StatsController['getEVSChart'];
  markDividendReinvested: DividendsController['markDividendReinvested'];
  setSharesToFundedState: SharesController['setSharesToFundedState'];
  setSharesToFundingState: SharesController['setSharesToFundingState'];
  setSharesToSettledState: SharesController['setSharesToSettledState'];
};

export const SharesAndDividendsApi = (container: ContainerInterface): SharesAndDividendsApiType => ({
  createShares: container.delegateTo(SharesController, 'createShares'),
  getAccountStats: container.delegateTo(StatsController, 'getAccountStats'),
  setSharesToFundedState: container.delegateTo(SharesController, 'setSharesToFundedState'),
  setSharesToFundingState: container.delegateTo(SharesController, 'setSharesToFundingState'),
  setSharesToSettledState: container.delegateTo(SharesController, 'setSharesToSettledState'),
  getEVSChart: container.delegateTo(StatsController, 'getEVSChart'),
  createManuallyIncentiveReward: container.delegateTo(IncentiveRewardController, 'createManuallyIncentiveReward'),
  getDividend: container.delegateTo(DividendsController, 'getDividend'),
  markDividendReinvested: container.delegateTo(DividendsController, 'markDividendReinvested'),
  declareDividend: container.delegateTo(DividendsController, 'declareDividend'),
  getDividendDeclarations: container.delegateTo(DividendsController, 'getDividendDeclarations'),
  getDividendDeclarationByDate: container.delegateTo(DividendsController, 'getDividendDeclarationByDate'),
});
