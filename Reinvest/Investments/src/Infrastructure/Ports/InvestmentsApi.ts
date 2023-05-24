import { ContainerInterface } from 'Container/Container';
import { TempController } from 'Investments/Infrastructure/Ports/TempController';

import { InvestmentsController } from './InvestmentsController';
import { SubscriptionAgreementController } from './SubscriptionAgreementController';

export type InvestmentsApiType = {
  assignSubscriptionAgreementToInvestment: InvestmentsController['assignSubscriptionAgreementToInvestment'];
  createInvestment: InvestmentsController['createInvestment'];
  createSubscriptionAgreement: SubscriptionAgreementController['createSubscriptionAgreement'];
  investmentSummaryQuery: InvestmentsController['investmentSummaryQuery'];
  signSubscriptionAgreement: SubscriptionAgreementController['signSubscriptionAgreement'];
  subscriptionAgreementQuery: SubscriptionAgreementController['subscriptionAgreementQuery'];
  test: TempController['handle'];
};

export const investmentsApi = (container: ContainerInterface): InvestmentsApiType => ({
  test: container.delegateTo(TempController, 'handle'),
  createInvestment: container.delegateTo(InvestmentsController, 'createInvestment'),
  investmentSummaryQuery: container.delegateTo(InvestmentsController, 'investmentSummaryQuery'),
  assignSubscriptionAgreementToInvestment: container.delegateTo(InvestmentsController, 'assignSubscriptionAgreementToInvestment'),
  createSubscriptionAgreement: container.delegateTo(SubscriptionAgreementController, 'createSubscriptionAgreement'),
  subscriptionAgreementQuery: container.delegateTo(SubscriptionAgreementController, 'subscriptionAgreementQuery'),
  signSubscriptionAgreement: container.delegateTo(SubscriptionAgreementController, 'signSubscriptionAgreement'),
});
