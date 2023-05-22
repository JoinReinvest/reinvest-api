import { ContainerInterface } from 'Container/Container';
import { TempController } from 'Investments/Infrastructure/Ports/TempController';

import { InvestmentsController } from './InvestmentsController';
import { SubscriptionAgreementController } from './SubscriptionAgreementController';

export type InvestmentsApiType = {
  createInvestment: InvestmentsController['createInvestment'];
  createSubscriptionAgreement: SubscriptionAgreementController['createSubscriptionAgreement'];
  subscriptionAgreementQuery: SubscriptionAgreementController['subscriptionAgreementQuery'];
  test: TempController['handle'];
};

export const investmentsApi = (container: ContainerInterface): InvestmentsApiType => ({
  test: container.delegateTo(TempController, 'handle'),
  createInvestment: container.delegateTo(InvestmentsController, 'createInvestment'),
  createSubscriptionAgreement: container.delegateTo(SubscriptionAgreementController, 'createSubscriptionAgreement'),
  subscriptionAgreementQuery: container.delegateTo(SubscriptionAgreementController, 'subscriptionAgreementQuery'),
});
