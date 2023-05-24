import { ContainerInterface } from 'Container/Container';
import { InvestmentsController } from 'Investments/Infrastructure/Ports/InvestmentsController';
import { TempController } from 'Investments/Infrastructure/Ports/TempController';
import CreateInvestment from 'Investments/Infrastructure/UseCases/CreateInvestment';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';

import { Investments } from '../..';
import { SubscriptionAgreementController } from '../Ports/SubscriptionAgreementController';
import AssignSubscriptionAgreementToInvestment from '../UseCases/AssignSubscriptionAgreementToInvestment';
import CreateSubscriptionAgreement from '../UseCases/CreateSubscriptionAgreement';
import InvestmentSummaryQuery from '../UseCases/InvestmentSummaryQuery';
import SignSubscriptionAgreement from '../UseCases/SignSubscriptionAgreement';
import SubscriptionAgreementQuery from '../UseCases/SubscriptionAgreementQuery';

export default class PortsProviders {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(TempController, [SimpleEventBus]);
    container.addSingleton(InvestmentsController, [CreateInvestment, InvestmentSummaryQuery, AssignSubscriptionAgreementToInvestment]);
    container.addSingleton(SubscriptionAgreementController, [CreateSubscriptionAgreement, SubscriptionAgreementQuery, SignSubscriptionAgreement]);
  }
}
