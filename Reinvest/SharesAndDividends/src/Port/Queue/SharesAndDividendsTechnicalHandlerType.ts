import { ContainerInterface } from 'Container/Container';
import { NavUpdateEventHandler } from 'SharesAndDividends/Port/Queue/NavUpdateEventHandler';

export type SharesAndDividendsTechnicalHandlerType = {
  NAV_UPDATED: NavUpdateEventHandler['handle'];
};

export const SharesAndDividendsTechnicalHandler = (container: ContainerInterface): SharesAndDividendsTechnicalHandlerType => ({
  NAV_UPDATED: container.delegateTo(NavUpdateEventHandler, 'handle'),
});
