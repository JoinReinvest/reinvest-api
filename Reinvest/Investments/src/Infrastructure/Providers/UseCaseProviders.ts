import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import CreateInvestment from 'Investments/Infrastructure/UseCases/CreateInvestment';
import CreateSubscriptionAgreement from 'Investments/Infrastructure/UseCases/CreateSubscriptionAgreement';

import { Investments } from '../..';
import InvestmentSummaryQuery from '../UseCases/InvestmentSummaryQuery';
import SignSubscriptionAgreement from '../UseCases/SignSubscriptionAgreement';
import SubscriptionAgreementQuery from '../UseCases/SubscriptionAgreementQuery';

export default class UseCaseProviders {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);

    container.addSingleton(CreateInvestment, [InvestmentsRepository, IdGenerator]);
    container.addSingleton(CreateSubscriptionAgreement, [SubscriptionAgreementRepository, InvestmentsRepository, IdGenerator]);
    container.addSingleton(SubscriptionAgreementQuery, [SubscriptionAgreementRepository]);
    container.addSingleton(InvestmentSummaryQuery, [InvestmentsRepository]);
    container.addSingleton(SignSubscriptionAgreement, [InvestmentsRepository, SubscriptionAgreementRepository]);
  }
}
