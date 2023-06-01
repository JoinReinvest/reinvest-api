import { ContainerInterface } from 'Container/Container';
import { TechnicalToDomainEventsHandler } from 'Investments/Infrastructure/Events/TechnicalToDomainEventsHandler';

export type InvestmentsTechnicalHandlerType = {
  AccountVerifiedForInvestment: () => TechnicalToDomainEventsHandler['handle'];
  InvestmentApproved: () => TechnicalToDomainEventsHandler['handle'];
  InvestmentFunded: () => TechnicalToDomainEventsHandler['handle'];
  InvestmentMarkedAsReadyToDisburse: () => TechnicalToDomainEventsHandler['handle'];
  InvestmentSharesTransferred: () => TechnicalToDomainEventsHandler['handle'];
  ReinvestmentSharesTransferred: () => TechnicalToDomainEventsHandler['handle'];
  TradeCreated: () => TechnicalToDomainEventsHandler['handle'];
};

export const investmentsTechnicalHandler = (container: ContainerInterface): InvestmentsTechnicalHandlerType => ({
  AccountVerifiedForInvestment: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  TradeCreated: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  InvestmentFunded: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  InvestmentApproved: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  InvestmentMarkedAsReadyToDisburse: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  InvestmentSharesTransferred: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  ReinvestmentSharesTransferred: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
});
