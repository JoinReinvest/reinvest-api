import { ContainerInterface } from 'Container/Container';
import { PdfEvents } from 'HKEKTypes/Pdf';
import { DisableRecurringInvestmentCommandHandler } from 'Investments/Infrastructure/Events/DisableRecurringInvestmentCommandHandler';
import { PdfGeneratedEventHandler } from 'Investments/Infrastructure/Events/PdfGeneratedEventHandler';
import { TechnicalToDomainEventsHandler } from 'Investments/Infrastructure/Events/TechnicalToDomainEventsHandler';

export type InvestmentsTechnicalHandlerType = {
  AccountBannedForInvestment: () => TechnicalToDomainEventsHandler['handle'];
  AccountVerifiedForInvestment: () => TechnicalToDomainEventsHandler['handle'];
  DisableAllRecurringInvestment: () => DisableRecurringInvestmentCommandHandler['handle'];
  DisableRecurringInvestment: () => DisableRecurringInvestmentCommandHandler['handle'];
  GracePeriodEnded: () => TechnicalToDomainEventsHandler['handle'];
  InvestmentApproved: () => TechnicalToDomainEventsHandler['handle'];
  InvestmentFunded: () => TechnicalToDomainEventsHandler['handle'];
  InvestmentMarkedAsReadyToDisburse: () => TechnicalToDomainEventsHandler['handle'];
  InvestmentPaymentFailed: () => TechnicalToDomainEventsHandler['handle'];
  InvestmentPaymentSecondFailed: () => TechnicalToDomainEventsHandler['handle'];
  InvestmentRejected: () => TechnicalToDomainEventsHandler['handle'];
  InvestmentSharesTransferred: () => TechnicalToDomainEventsHandler['handle'];
  TradePaymentMismatched: () => TechnicalToDomainEventsHandler['handle'];
  TransactionCanceled: () => TechnicalToDomainEventsHandler['handle'];
  TransactionCanceledFailed: () => TechnicalToDomainEventsHandler['handle'];
  TransactionReverted: () => TechnicalToDomainEventsHandler['handle'];
  TransactionRevertedFailed: () => TechnicalToDomainEventsHandler['handle'];
  TransactionRevertedUnwinding: () => TechnicalToDomainEventsHandler['handle'];
  TransactionUnwinding: () => TechnicalToDomainEventsHandler['handle'];
  [PdfEvents.PdfGenerated]: () => PdfGeneratedEventHandler['handle'];
  PaymentRetried: () => TechnicalToDomainEventsHandler['handle'];
  ReinvestmentSharesTransferred: () => TechnicalToDomainEventsHandler['handle'];
  TradeCreated: () => TechnicalToDomainEventsHandler['handle'];
};

export const investmentsTechnicalHandler = (container: ContainerInterface): InvestmentsTechnicalHandlerType => ({
  AccountBannedForInvestment: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  AccountVerifiedForInvestment: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  TradeCreated: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  TradePaymentMismatched: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  InvestmentFunded: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  InvestmentApproved: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  InvestmentPaymentSecondFailed: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  InvestmentMarkedAsReadyToDisburse: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  InvestmentSharesTransferred: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  ReinvestmentSharesTransferred: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  InvestmentRejected: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  TransactionCanceled: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  TransactionUnwinding: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  TransactionCanceledFailed: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  GracePeriodEnded: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  [PdfEvents.PdfGenerated]: container.delegateTo(PdfGeneratedEventHandler, 'handle'),
  TransactionReverted: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  TransactionRevertedFailed: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  TransactionRevertedUnwinding: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  InvestmentPaymentFailed: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  PaymentRetried: container.delegateTo(TechnicalToDomainEventsHandler, 'handle'),
  DisableRecurringInvestment: container.delegateTo(DisableRecurringInvestmentCommandHandler, 'handle'),
  DisableAllRecurringInvestment: container.delegateTo(DisableRecurringInvestmentCommandHandler, 'handle'),
});
