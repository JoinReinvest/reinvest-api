import { ContainerInterface } from 'Container/Container';
import { InvestmentsController } from 'Investments/Infrastructure/Ports/InvestmentsController';
import { TempController } from 'Investments/Infrastructure/Ports/TempController';
import CreateInvestment from 'Investments/Infrastructure/UseCases/CreateInvestment';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';

import { Investments } from '../..';
import { SubscriptionAgreementController } from '../Ports/SubscriptionAgreementController';
import CreateSubscriptionAgreement from '../UseCases/CreateSubscriptionAgreement';
export default class PortsProviders {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(TempController, [SimpleEventBus]);
    container.addSingleton(InvestmentsController, [CreateInvestment]);
    container.addSingleton(SubscriptionAgreementController, [CreateSubscriptionAgreement]);
  }
}
