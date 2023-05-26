import { ContainerInterface } from 'Container/Container';
import { SharesController } from 'SharesAndDividends/Port/Api/SharesController';
import { StatsController } from 'SharesAndDividends/Port/Api/StatsController';

export type SharesAndDividendsApiType = {
  createShares: SharesController['createShares'];
  getAccountStats: StatsController['getAccountStats'];
};

export const SharesAndDividendsApi = (container: ContainerInterface): SharesAndDividendsApiType => ({
  createShares: container.delegateTo(SharesController, 'createShares'),
  getAccountStats: container.delegateTo(StatsController, 'getAccountStats'),
});
