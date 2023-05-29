import { ContainerInterface } from 'Container/Container';
import { IncentiveRewardController } from 'SharesAndDividends/Port/Api/IncentiveRewardController';
import { SharesController } from 'SharesAndDividends/Port/Api/SharesController';
import { StatsController } from 'SharesAndDividends/Port/Api/StatsController';

export type SharesAndDividendsApiType = {
  createManuallyIncentiveReward: IncentiveRewardController['createManuallyIncentiveReward'];
  createShares: SharesController['createShares'];
  getAccountStats: StatsController['getAccountStats'];
  getEVSChart: StatsController['getEVSChart'];
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
});
