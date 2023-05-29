import { ContainerInterface } from 'Container/Container';
import { FeesController } from 'Investments/Infrastructure/Ports/FeesController';
import { InvestmentsController } from 'Investments/Infrastructure/Ports/InvestmentsController';
import { ScheduleSimulationController } from 'Investments/Infrastructure/Ports/ScheduleSimulationController';
import { SubscriptionAgreementController } from 'Investments/Infrastructure/Ports/SubscriptionAgreementController';
import { TempController } from 'Investments/Infrastructure/Ports/TempController';
import { RecurringInvestmentsController } from 'Reinvest/Investments/src/Infrastructure/Ports/RecurringInvestmentsController';

export type InvestmentsApiType = {
  approveFees: FeesController['approveFees'];
  assignSubscriptionAgreementToInvestment: InvestmentsController['assignSubscriptionAgreementToInvestment'];
  assignSubscriptionAgreementToRecurringInvestment: RecurringInvestmentsController['assignSubscriptionAgreementToRecurringInvestment'];
  createInvestment: InvestmentsController['createInvestment'];
  createRecurringInvestment: RecurringInvestmentsController['createRecurringInvestment'];
  createRecurringSubscriptionAgreement: SubscriptionAgreementController['createRecurringSubscriptionAgreement'];
  createSubscriptionAgreement: SubscriptionAgreementController['createSubscriptionAgreement'];
  deleteRecurringInvestment: RecurringInvestmentsController['deleteRecurringInvestment'];
  getRecurringInvestment: RecurringInvestmentsController['getRecurringInvestment'];
  getScheduleSimulation: ScheduleSimulationController['getScheduleSimulation'];
  investmentSummaryQuery: InvestmentsController['investmentSummaryQuery'];
  isFeesApproved: FeesController['isFeesApproved'];
  signSubscriptionAgreement: SubscriptionAgreementController['signSubscriptionAgreement'];
  startInvestment: InvestmentsController['startInvestment'];
  subscriptionAgreementQuery: SubscriptionAgreementController['subscriptionAgreementQuery'];
  test: TempController['handle'];
};

export const investmentsApi = (container: ContainerInterface): InvestmentsApiType => ({
  test: container.delegateTo(TempController, 'handle'),
  createInvestment: container.delegateTo(InvestmentsController, 'createInvestment'),
  createRecurringInvestment: container.delegateTo(RecurringInvestmentsController, 'createRecurringInvestment'),
  getRecurringInvestment: container.delegateTo(RecurringInvestmentsController, 'getRecurringInvestment'),
  assignSubscriptionAgreementToRecurringInvestment: container.delegateTo(RecurringInvestmentsController, 'assignSubscriptionAgreementToRecurringInvestment'),
  deleteRecurringInvestment: container.delegateTo(RecurringInvestmentsController, 'deleteRecurringInvestment'),
  getScheduleSimulation: container.delegateTo(ScheduleSimulationController, 'getScheduleSimulation'),
  startInvestment: container.delegateTo(InvestmentsController, 'startInvestment'),
  approveFees: container.delegateTo(FeesController, 'approveFees'),
  isFeesApproved: container.delegateTo(FeesController, 'isFeesApproved'),
  investmentSummaryQuery: container.delegateTo(InvestmentsController, 'investmentSummaryQuery'),
  assignSubscriptionAgreementToInvestment: container.delegateTo(InvestmentsController, 'assignSubscriptionAgreementToInvestment'),
  createSubscriptionAgreement: container.delegateTo(SubscriptionAgreementController, 'createSubscriptionAgreement'),
  createRecurringSubscriptionAgreement: container.delegateTo(SubscriptionAgreementController, 'createRecurringSubscriptionAgreement'),
  subscriptionAgreementQuery: container.delegateTo(SubscriptionAgreementController, 'subscriptionAgreementQuery'),
  signSubscriptionAgreement: container.delegateTo(SubscriptionAgreementController, 'signSubscriptionAgreement'),
});
