import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { TransactionExecutor } from 'Investments/Application/TransactionProcessManager/TransactionExecutor';
import AbortInvestment from 'Investments/Application/UseCases/AbortInvestment';
import ApproveFees from 'Investments/Application/UseCases/ApproveFees';
import CreateInvestment from 'Investments/Application/UseCases/CreateInvestment';
import CreateRecurringSubscriptionAgreement from 'Investments/Application/UseCases/CreateRecurringSubscriptionAgreement';
import CreateSubscriptionAgreement from 'Investments/Application/UseCases/CreateSubscriptionAgreement';
import DeactivateRecurringInvestment from 'Investments/Application/UseCases/DeactivateRecurringInvestment';
import InitiateRecurringInvestment from 'Investments/Application/UseCases/InitiateRecurringInvestment';
import InvestmentSummaryQuery from 'Investments/Application/UseCases/InvestmentSummaryQuery';
import IsFeeApproved from 'Investments/Application/UseCases/IsFeeApproved';
import { PushTransaction } from 'Investments/Application/UseCases/PushTransaction';
import RecurringInvestmentQuery from 'Investments/Application/UseCases/RecurringInvestmentQuery';
import { ReinvestDividend } from 'Investments/Application/UseCases/ReinvestDividend';
import ScheduleSimulationQuery from 'Investments/Application/UseCases/ScheduleSimulationQuery';
import SignRecurringSubscriptionAgreement from 'Investments/Application/UseCases/SignRecurringSubscriptionAgreement';
import SignSubscriptionAgreement from 'Investments/Application/UseCases/SignSubscriptionAgreement';
import StartInvestment from 'Investments/Application/UseCases/StartInvestment';
import SubscriptionAgreementQuery from 'Investments/Application/UseCases/SubscriptionAgreementQuery';
import { Investments } from 'Investments/index';
import { SharesAndDividendService } from 'Investments/Infrastructure/Adapters/Modules/SharesAndDividendService';
import {
  InvestmentsDatabase,
  InvestmentsDatabaseAdapterInstanceProvider,
  InvestmentsDatabaseAdapterProvider,
} from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { FeesRepository } from 'Investments/Infrastructure/Adapters/Repository/FeesRepository';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { TransactionRepository } from 'Investments/Infrastructure/Adapters/Repository/TransactionRepository';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import CreateDraftRecurringInvestment from 'Reinvest/Investments/src/Application/UseCases/CreateDraftRecurringInvestment';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';

export default class UseCaseProviders {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);

    container.addObjectFactory(
      'InvestmentsDatabaseAdapter',
      (databaseProvider: InvestmentsDatabaseAdapterProvider) => new TransactionalAdapter<InvestmentsDatabase>(databaseProvider),
      [InvestmentsDatabaseAdapterInstanceProvider],
    );

    container.addSingleton(CreateInvestment, [InvestmentsRepository, IdGenerator]);
    container.addSingleton(CreateSubscriptionAgreement, [SubscriptionAgreementRepository, InvestmentsRepository, IdGenerator]);
    container.addSingleton(SubscriptionAgreementQuery, [SubscriptionAgreementRepository]);
    container.addSingleton(InvestmentSummaryQuery, [InvestmentsRepository]);
    container.addSingleton(SignSubscriptionAgreement, [SubscriptionAgreementRepository, InvestmentsRepository]);
    container.addSingleton(SignRecurringSubscriptionAgreement, [SubscriptionAgreementRepository, RecurringInvestmentsRepository]);
    container.addSingleton(ApproveFees, [FeesRepository]);
    container.addSingleton(StartInvestment, [InvestmentsRepository]);
    container.addSingleton(IsFeeApproved, [FeesRepository]);
    container.addSingleton(ScheduleSimulationQuery);
    container.addSingleton(CreateDraftRecurringInvestment, [
      RecurringInvestmentsRepository,
      SubscriptionAgreementRepository,
      IdGenerator,
      'InvestmentsDatabaseAdapter',
    ]);
    container.addSingleton(RecurringInvestmentQuery, [RecurringInvestmentsRepository]);
    container.addSingleton(CreateRecurringSubscriptionAgreement, [SubscriptionAgreementRepository, RecurringInvestmentsRepository, IdGenerator]);
    container.addSingleton(InitiateRecurringInvestment, [RecurringInvestmentsRepository]);
    container.addSingleton(DeactivateRecurringInvestment, [RecurringInvestmentsRepository]);
    container.addSingleton(ReinvestDividend, [SharesAndDividendService, SimpleEventBus]);
    container.addSingleton(PushTransaction, [TransactionRepository, TransactionExecutor]);
    container.addSingleton(AbortInvestment, [RecurringInvestmentsRepository, FeesRepository, 'InvestmentsDatabaseAdapter']);
  }
}
