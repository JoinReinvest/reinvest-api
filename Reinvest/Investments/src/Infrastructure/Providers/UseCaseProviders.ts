import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import ApproveFees from 'Investments/Application/UseCases/ApproveFees';
import AssignSubscriptionAgreementToInvestment from 'Investments/Application/UseCases/AssignSubscriptionAgreementToInvestment';
import AssignSubscriptionAgreementToRecurringInvestment from 'Investments/Application/UseCases/AssignSubscriptionAgreementToRecurringInvestment';
import CreateInvestment from 'Investments/Application/UseCases/CreateInvestment';
import CreateRecurringInvestment from 'Investments/Application/UseCases/CreateRecurringInvestment';
import CreateRecurringSubscriptionAgreement from 'Investments/Application/UseCases/CreateRecurringSubscriptionAgreement';
import CreateSubscriptionAgreement from 'Investments/Application/UseCases/CreateSubscriptionAgreement';
import DeactivateRecurringInvestment from 'Investments/Application/UseCases/DeactivateRecurringInvestment';
import DeleteRecurringInvestment from 'Investments/Application/UseCases/DeleteRecurringInvestment';
import InitiateRecurringInvestment from 'Investments/Application/UseCases/InitiateRecurringInvestment';
import InvestmentSummaryQuery from 'Investments/Application/UseCases/InvestmentSummaryQuery';
import IsFeeApproved from 'Investments/Application/UseCases/IsFeeApproved';
import RecurringInvestmentQuery from 'Investments/Application/UseCases/RecurringInvestmentQuery';
import ScheduleSimulationQuery from 'Investments/Application/UseCases/ScheduleSimulationQuery';
import SignSubscriptionAgreement from 'Investments/Application/UseCases/SignSubscriptionAgreement';
import StartInvestment from 'Investments/Application/UseCases/StartInvestment';
import SubscriptionAgreementQuery from 'Investments/Application/UseCases/SubscriptionAgreementQuery';
import { Investments } from 'Investments/index';
import { FeesRepository } from 'Investments/Infrastructure/Adapters/Repository/FeesRepository';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
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
    container.addSingleton(ScheduleSimulationQuery);
    container.addSingleton(CreateRecurringInvestment, [RecurringInvestmentsRepository, IdGenerator]);
    container.addSingleton(RecurringInvestmentQuery, [RecurringInvestmentsRepository]);
    container.addSingleton(DeleteRecurringInvestment, [RecurringInvestmentsRepository, SubscriptionAgreementRepository]);
    container.addSingleton(CreateRecurringSubscriptionAgreement, [SubscriptionAgreementRepository, RecurringInvestmentsRepository, IdGenerator]);
    container.addSingleton(AssignSubscriptionAgreementToRecurringInvestment, [RecurringInvestmentsRepository]);
    container.addSingleton(InitiateRecurringInvestment, [RecurringInvestmentsRepository]);
    container.addSingleton(DeactivateRecurringInvestment, [RecurringInvestmentsRepository]);
  }
}
