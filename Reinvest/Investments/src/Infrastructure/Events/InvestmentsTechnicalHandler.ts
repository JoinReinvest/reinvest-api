import { ContainerInterface } from 'Container/Container';
import { TechnicalToDomainEventsHandler } from 'Investments/Infrastructure/Events/TechnicalToDomainEventsHandler';

export type InvestmentsTechnicalHandlerType = {
  AccountVerifiedForInvestment: () => TechnicalToDomainEventsHandler['handle'];
};

export const investmentsTechnicalHandler = (container: ContainerInterface): InvestmentsTechnicalHandlerType => ({
  AccountVerifiedForInvestment: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
});
