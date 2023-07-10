import { ContainerInterface } from 'Container/Container';
import { PdfEvents } from 'HKEKTypes/Pdf';
import { PdfGeneratedEventHandler } from 'Investments/Infrastructure/Events/PdfGeneratedEventHandler';
import { TechnicalToDomainEventsHandler } from 'Investments/Infrastructure/Events/TechnicalToDomainEventsHandler';

export type InvestmentsTechnicalHandlerType = {
  AccountBannedForInvestment: () => TechnicalToDomainEventsHandler['handle'];
  AccountVerifiedForInvestment: () => TechnicalToDomainEventsHandler['handle'];
  GracePeriodEnded: () => TechnicalToDomainEventsHandler['handle'];
  InvestmentApproved: () => TechnicalToDomainEventsHandler['handle'];
  InvestmentFunded: () => TechnicalToDomainEventsHandler['handle'];
  InvestmentMarkedAsReadyToDisburse: () => TechnicalToDomainEventsHandler['handle'];
  InvestmentRejected: () => TechnicalToDomainEventsHandler['handle'];
  InvestmentSharesTransferred: () => TechnicalToDomainEventsHandler['handle'];
  ReinvestmentSharesTransferred: () => TechnicalToDomainEventsHandler['handle'];
  TradeCreated: () => TechnicalToDomainEventsHandler['handle'];
  TransactionCanceled: () => TechnicalToDomainEventsHandler['handle'];
  TransactionCanceledFailed: () => TechnicalToDomainEventsHandler['handle'];
  TransactionUnwinding: () => TechnicalToDomainEventsHandler['handle'];
  [PdfEvents.PdfGenerated]: () => PdfGeneratedEventHandler['handle'];
};

export const investmentsTechnicalHandler = (container: ContainerInterface): InvestmentsTechnicalHandlerType => ({
  AccountBannedForInvestment: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  AccountVerifiedForInvestment: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  TradeCreated: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  InvestmentFunded: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  InvestmentApproved: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  InvestmentMarkedAsReadyToDisburse: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  InvestmentSharesTransferred: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  ReinvestmentSharesTransferred: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  InvestmentRejected: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  TransactionCanceled: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  TransactionUnwinding: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  TransactionCanceledFailed: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  GracePeriodEnded: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  [PdfEvents.PdfGenerated]: container.delegateTo(PdfGeneratedEventHandler, 'handle'),
});
