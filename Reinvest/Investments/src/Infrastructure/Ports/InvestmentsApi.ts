import { ContainerInterface } from 'Container/Container';
import { DividendsController } from 'Investments/Infrastructure/Ports/DividendsController';
import { FeesController } from 'Investments/Infrastructure/Ports/FeesController';
import { InvestmentsController } from 'Investments/Infrastructure/Ports/InvestmentsController';
import { SubscriptionAgreementController } from 'Investments/Infrastructure/Ports/SubscriptionAgreementController';
import { TempController } from 'Investments/Infrastructure/Ports/TempController';
import { TransactionController } from 'Investments/Infrastructure/Ports/TransactionController';

export type InvestmentsApiType = {
  approveFees: FeesController['approveFees'];
  assignSubscriptionAgreementToInvestment: InvestmentsController['assignSubscriptionAgreementToInvestment'];
  createInvestment: InvestmentsController['createInvestment'];
  createSubscriptionAgreement: SubscriptionAgreementController['createSubscriptionAgreement'];
  investmentSummaryQuery: InvestmentsController['investmentSummaryQuery'];
  isFeesApproved: FeesController['isFeesApproved'];
  pushTransaction: TransactionController['pushTransaction'];
  reinvestDividends: DividendsController['reinvestDividends'];
  signSubscriptionAgreement: SubscriptionAgreementController['signSubscriptionAgreement'];
  startInvestment: InvestmentsController['startInvestment'];
  subscriptionAgreementQuery: SubscriptionAgreementController['subscriptionAgreementQuery'];
  test: TempController['handle'];
};

export const investmentsApi = (container: ContainerInterface): InvestmentsApiType => ({
  test: container.delegateTo(TempController, 'handle'),
  createInvestment: container.delegateTo(InvestmentsController, 'createInvestment'),
  startInvestment: container.delegateTo(InvestmentsController, 'startInvestment'),
  approveFees: container.delegateTo(FeesController, 'approveFees'),
  isFeesApproved: container.delegateTo(FeesController, 'isFeesApproved'),
  investmentSummaryQuery: container.delegateTo(InvestmentsController, 'investmentSummaryQuery'),
  assignSubscriptionAgreementToInvestment: container.delegateTo(InvestmentsController, 'assignSubscriptionAgreementToInvestment'),
  createSubscriptionAgreement: container.delegateTo(SubscriptionAgreementController, 'createSubscriptionAgreement'),
  subscriptionAgreementQuery: container.delegateTo(SubscriptionAgreementController, 'subscriptionAgreementQuery'),
  signSubscriptionAgreement: container.delegateTo(SubscriptionAgreementController, 'signSubscriptionAgreement'),
  reinvestDividends: container.delegateTo(DividendsController, 'reinvestDividends'),
  pushTransaction: container.delegateTo(TransactionController, 'pushTransaction'),
});
