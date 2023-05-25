import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import ApproveFees from 'Investments/Application/UseCases/ApproveFees';
import AssignSubscriptionAgreementToInvestment from 'Investments/Application/UseCases/AssignSubscriptionAgreementToInvestment';
import CreateInvestment from 'Investments/Application/UseCases/CreateInvestment';
import CreateSubscriptionAgreement from 'Investments/Application/UseCases/CreateSubscriptionAgreement';
import InvestmentSummaryQuery from 'Investments/Application/UseCases/InvestmentSummaryQuery';
import IsFeeApproved from 'Investments/Application/UseCases/IsFeeApproved';
import SignSubscriptionAgreement from 'Investments/Application/UseCases/SignSubscriptionAgreement';
import StartInvestment from 'Investments/Application/UseCases/StartInvestment';
import SubscriptionAgreementQuery from 'Investments/Application/UseCases/SubscriptionAgreementQuery';
import { Investments } from 'Investments/index';
import { FeesRepository } from 'Investments/Infrastructure/Adapters/Repository/FeesRepository';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';

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
    container.addSingleton(SignSubscriptionAgreement, [SubscriptionAgreementRepository]);
    container.addSingleton(AssignSubscriptionAgreementToInvestment, [InvestmentsRepository]);
    container.addSingleton(ApproveFees, [FeesRepository]);
    container.addSingleton(StartInvestment, [InvestmentsRepository, SubscriptionAgreementRepository]);
    container.addSingleton(IsFeeApproved, [FeesRepository]);
  }
}
