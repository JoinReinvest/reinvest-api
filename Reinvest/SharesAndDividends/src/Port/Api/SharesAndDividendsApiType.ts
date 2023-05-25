import { ContainerInterface } from 'Container/Container';

export type SharesAndDividendsApiType = {
  // canObjectBeUpdated: UserSharesAndDividendsActions['canObjectBeUpdated'];
};

export const SharesAndDividendsApi = (container: ContainerInterface): SharesAndDividendsApiType => ({
  // canObjectBeUpdated: container.delegateTo(UserSharesAndDividendsActions, 'canObjectBeUpdated'),
});
