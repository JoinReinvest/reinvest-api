import { ContainerInterface } from 'Container/Container';
import { DividendsController } from 'Investments/Infrastructure/Ports/DividendsController';
import { FeesController } from 'Investments/Infrastructure/Ports/FeesController';
import { InvestmentsController } from 'Investments/Infrastructure/Ports/InvestmentsController';
import { ScheduleSimulationController } from 'Investments/Infrastructure/Ports/ScheduleSimulationController';
import { SubscriptionAgreementController } from 'Investments/Infrastructure/Ports/SubscriptionAgreementController';
import { TempController } from 'Investments/Infrastructure/Ports/TempController';
import { TransactionController } from 'Investments/Infrastructure/Ports/TransactionController';
import { RecurringInvestmentsController } from 'Reinvest/Investments/src/Infrastructure/Ports/RecurringInvestmentsController';

export type InvestmentsApiType = {
  abortInvestment: InvestmentsController['abortInvestment'];
  approveFees: FeesController['approveFees'];
  cancelInvestment: InvestmentsController['cancelInvestment'];
  createDraftRecurringInvestment: RecurringInvestmentsController['createDraftRecurringInvestment'];
  createInvestment: InvestmentsController['createInvestment'];
  createRecurringSubscriptionAgreement: SubscriptionAgreementController['createRecurringSubscriptionAgreement'];
  createSubscriptionAgreement: SubscriptionAgreementController['createSubscriptionAgreement'];
  deactivateRecurringInvestment: RecurringInvestmentsController['deactivateRecurringInvestment'];
  getRecurringInvestment: RecurringInvestmentsController['getRecurringInvestment'];
  getScheduleSimulation: ScheduleSimulationController['getScheduleSimulation'];
  initiateRecurringInvestment: RecurringInvestmentsController['initiateRecurringInvestment'];
  investmentSummaryQuery: InvestmentsController['investmentSummaryQuery'];
  isFeesApproved: FeesController['isFeesApproved'];
  listInvestments: InvestmentsController['listInvestments'];
  pushTransaction: TransactionController['pushTransaction'];
  reinvestDividends: DividendsController['reinvestDividends'];
  signRecurringSubscriptionAgreement: SubscriptionAgreementController['signRecurringSubscriptionAgreement'];
  signSubscriptionAgreement: SubscriptionAgreementController['signSubscriptionAgreement'];
  startInvestment: InvestmentsController['startInvestment'];
  subscriptionAgreementQuery: SubscriptionAgreementController['subscriptionAgreementQuery'];
  test: TempController['handle'];
  transferInvestments: InvestmentsController['transferInvestments'];
  unsuspendRecurringInvestment: RecurringInvestmentsController['unsuspendRecurringInvestment'];
};

export const investmentsApi = (container: ContainerInterface): InvestmentsApiType => ({
  test: container.delegateTo(TempController, 'handle'),
  createInvestment: container.delegateTo(InvestmentsController, 'createInvestment'),
  listInvestments: container.delegateTo(InvestmentsController, 'listInvestments'),
  createDraftRecurringInvestment: container.delegateTo(RecurringInvestmentsController, 'createDraftRecurringInvestment'),
  unsuspendRecurringInvestment: container.delegateTo(RecurringInvestmentsController, 'unsuspendRecurringInvestment'),
  abortInvestment: container.delegateTo(InvestmentsController, 'abortInvestment'),
  getRecurringInvestment: container.delegateTo(RecurringInvestmentsController, 'getRecurringInvestment'),
  deactivateRecurringInvestment: container.delegateTo(RecurringInvestmentsController, 'deactivateRecurringInvestment'),
  initiateRecurringInvestment: container.delegateTo(RecurringInvestmentsController, 'initiateRecurringInvestment'),
  getScheduleSimulation: container.delegateTo(ScheduleSimulationController, 'getScheduleSimulation'),
  startInvestment: container.delegateTo(InvestmentsController, 'startInvestment'),
  approveFees: container.delegateTo(FeesController, 'approveFees'),
  isFeesApproved: container.delegateTo(FeesController, 'isFeesApproved'),
  investmentSummaryQuery: container.delegateTo(InvestmentsController, 'investmentSummaryQuery'),
  createSubscriptionAgreement: container.delegateTo(SubscriptionAgreementController, 'createSubscriptionAgreement'),
  signRecurringSubscriptionAgreement: container.delegateTo(SubscriptionAgreementController, 'signRecurringSubscriptionAgreement'),
  createRecurringSubscriptionAgreement: container.delegateTo(SubscriptionAgreementController, 'createRecurringSubscriptionAgreement'),
  subscriptionAgreementQuery: container.delegateTo(SubscriptionAgreementController, 'subscriptionAgreementQuery'),
  signSubscriptionAgreement: container.delegateTo(SubscriptionAgreementController, 'signSubscriptionAgreement'),
  reinvestDividends: container.delegateTo(DividendsController, 'reinvestDividends'),
  pushTransaction: container.delegateTo(TransactionController, 'pushTransaction'),
  cancelInvestment: container.delegateTo(InvestmentsController, 'cancelInvestment'),
  transferInvestments: container.delegateTo(InvestmentsController, 'transferInvestments'),
});
