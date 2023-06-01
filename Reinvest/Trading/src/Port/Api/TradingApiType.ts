import { ContainerInterface } from 'Container/Container';

export type TradingApiType = {
  // canObjectBeUpdated: UserTradingActions['canObjectBeUpdated'];
};

export const TradingApi = (container: ContainerInterface): TradingApiType => ({
  // canObjectBeUpdated: container.delegateTo(UserTradingActions, 'canObjectBeUpdated'),
});
