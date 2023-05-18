import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import CreateInvestment from 'Investments/Infrastructure/UseCases/CreateInvestment';
import CreateSubscriptionAgreement from 'Investments/Infrastructure/UseCases/CreateSubscriptionAgreement';

import { Investments } from '../..';

export default class UseCaseProviders {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);

    container.addSingleton(CreateInvestment, [InvestmentsRepository, IdGenerator]);
    container.addSingleton(CreateSubscriptionAgreement, [SubscriptionAgreementRepository, IdGenerator]);
  }
}
