import { ContainerInterface } from 'Container/Container';
import { SharesController } from 'SharesAndDividends/Port/Api/SharesController';

export type SharesAndDividendsApiType = {
  createShares: SharesController['createShares'];
};

export const SharesAndDividendsApi = (container: ContainerInterface): SharesAndDividendsApiType => ({
  createShares: container.delegateTo(SharesController, 'createShares'),
});
