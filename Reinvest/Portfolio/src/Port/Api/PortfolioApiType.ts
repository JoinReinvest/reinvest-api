import { ContainerInterface } from 'Container/Container';

export type PortfolioApiType = {
  // canObjectBeUpdated: UserPortfolioActions['canObjectBeUpdated'];
};

export const PortfolioApi = (container: ContainerInterface): PortfolioApiType => ({
  // canObjectBeUpdated: container.delegateTo(UserPortfolioActions, 'canObjectBeUpdated'),
});
