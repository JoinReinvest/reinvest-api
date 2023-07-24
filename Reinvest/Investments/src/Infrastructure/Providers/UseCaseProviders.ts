import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { ReinvestmentExecutor } from 'Investments/Application/ReinvestmentProcessManager/ReinvestmentExecutor';
import { TransactionExecutor } from 'Investments/Application/TransactionProcessManager/TransactionExecutor';
import AbortInvestment from 'Investments/Application/UseCases/AbortInvestment';
import ApproveFees from 'Investments/Application/UseCases/ApproveFees';
import { CancelInvestment } from 'Investments/Application/UseCases/CancelInvestment';
import { CreateInvestment } from 'Investments/Application/UseCases/CreateInvestment';
import { CreateInvestmentFromRecurringInvestment } from 'Investments/Application/UseCases/CreateInvestmentFromRecurringInvestment';
import CreateRecurringSubscriptionAgreement from 'Investments/Application/UseCases/CreateRecurringSubscriptionAgreement';
import CreateSubscriptionAgreement from 'Investments/Application/UseCases/CreateSubscriptionAgreement';
import DeactivateRecurringInvestment from 'Investments/Application/UseCases/DeactivateRecurringInvestment';
import { GenerateSubscriptionAgreement } from 'Investments/Application/UseCases/GenerateSubscriptionAgreement';
import InitiateRecurringInvestment from 'Investments/Application/UseCases/InitiateRecurringInvestment';
import InvestmentSummaryQuery from 'Investments/Application/UseCases/InvestmentSummaryQuery';
import IsFeeApproved from 'Investments/Application/UseCases/IsFeeApproved';
import ListInvestmentsQuery from 'Investments/Application/UseCases/ListInvestmentsQuery';
import { MarkSubscriptionAgreementAsGenerated } from 'Investments/Application/UseCases/MarkSubscriptionAgreementAsGenerated';
import { PushReinvestment } from 'Investments/Application/UseCases/PushReinvestment';
import { PushTransaction } from 'Investments/Application/UseCases/PushTransaction';
import RecurringInvestmentQuery from 'Investments/Application/UseCases/RecurringInvestmentQuery';
import { ReinvestDividend } from 'Investments/Application/UseCases/ReinvestDividend';
import ScheduleSimulationQuery from 'Investments/Application/UseCases/ScheduleSimulationQuery';
import SignRecurringSubscriptionAgreement from 'Investments/Application/UseCases/SignRecurringSubscriptionAgreement';
import SignSubscriptionAgreement from 'Investments/Application/UseCases/SignSubscriptionAgreement';
import StartInvestment from 'Investments/Application/UseCases/StartInvestment';
import SubscriptionAgreementQuery from 'Investments/Application/UseCases/SubscriptionAgreementQuery';
import { SuspendRecurringInvestment } from 'Investments/Application/UseCases/SuspendRecurringInvestment';
import { TransferInvestments } from 'Investments/Application/UseCases/TransferInvestments';
import UnsuspendRecurringInvestment from 'Investments/Application/UseCases/UnsuspendRecurringInvestment';
import { InvestmentFeeService } from 'Investments/Domain/Service/InvestmentFeeService';
import { Investments } from 'Investments/index';
import { DocumentsService } from 'Investments/Infrastructure/Adapters/Modules/DocumentsService';
import { PortfolioService } from 'Investments/Infrastructure/Adapters/Modules/PortfolioService';
import { SharesAndDividendService } from 'Investments/Infrastructure/Adapters/Modules/SharesAndDividendService';
import { SubscriptionAgreementDataCollector } from 'Investments/Infrastructure/Adapters/Modules/SubscriptionAgreementDataCollector';
import { VerificationService } from 'Investments/Infrastructure/Adapters/Modules/VerificationService';
import { FeesRepository } from 'Investments/Infrastructure/Adapters/Repository/FeesRepository';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { RecurringInvestmentExecutionRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestmentExecutionRepository';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { ReinvestmentRepository } from 'Investments/Infrastructure/Adapters/Repository/ReinvestmentRepository';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { TransactionRepository } from 'Investments/Infrastructure/Adapters/Repository/TransactionRepository';
import CreateDraftRecurringInvestment from 'Reinvest/Investments/src/Application/UseCases/CreateDraftRecurringInvestment';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';

export default class UseCaseProviders {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);
    container.addSingleton(InvestmentFeeService, [VerificationService, IdGenerator]);

    container.addSingleton(CreateInvestment, [
      InvestmentsRepository,
      FeesRepository,
      InvestmentFeeService,
      IdGenerator,
      'InvestmentsTransactionalAdapter',
      PortfolioService,
    ]);
    container.addSingleton(CreateInvestmentFromRecurringInvestment, [
      RecurringInvestmentsRepository,
      RecurringInvestmentExecutionRepository,
      InvestmentsRepository,
      InvestmentFeeService,
      'InvestmentsTransactionalAdapter',
      IdGenerator,
      PortfolioService,
    ]);
    container.addSingleton(SuspendRecurringInvestment, [RecurringInvestmentsRepository, RecurringInvestmentExecutionRepository]);
    container.addSingleton(CreateSubscriptionAgreement, [
      SubscriptionAgreementRepository,
      InvestmentsRepository,
      SubscriptionAgreementDataCollector,
      IdGenerator,
    ]);
    container.addSingleton(SubscriptionAgreementQuery, [SubscriptionAgreementRepository]);
    container.addSingleton(InvestmentSummaryQuery, [InvestmentsRepository]);
    container.addSingleton(SignSubscriptionAgreement, [SubscriptionAgreementRepository, InvestmentsRepository, DocumentsService]);
    container.addSingleton(SignRecurringSubscriptionAgreement, [SubscriptionAgreementRepository, RecurringInvestmentsRepository, DocumentsService]);
    container.addSingleton(ApproveFees, [FeesRepository]);
    container.addSingleton(StartInvestment, [InvestmentsRepository]);
    container.addSingleton(IsFeeApproved, [FeesRepository]);
    container.addSingleton(ScheduleSimulationQuery);
    container.addSingleton(CreateDraftRecurringInvestment, [
      RecurringInvestmentsRepository,
      SubscriptionAgreementRepository,
      IdGenerator,
      'InvestmentsTransactionalAdapter',
    ]);
    container.addSingleton(RecurringInvestmentQuery, [RecurringInvestmentsRepository]);
    container.addSingleton(CreateRecurringSubscriptionAgreement, [
      SubscriptionAgreementRepository,
      RecurringInvestmentsRepository,
      SubscriptionAgreementDataCollector,
      IdGenerator,
    ]);
    container.addSingleton(InitiateRecurringInvestment, [RecurringInvestmentsRepository]);
    container.addSingleton(DeactivateRecurringInvestment, [RecurringInvestmentsRepository]);
    container.addSingleton(UnsuspendRecurringInvestment, [RecurringInvestmentsRepository]);
    container.addSingleton(ReinvestDividend, [SharesAndDividendService, SimpleEventBus]);
    container.addSingleton(PushTransaction, [TransactionRepository, TransactionExecutor]);
    container.addSingleton(PushReinvestment, [ReinvestmentRepository, ReinvestmentExecutor]);
    container.addSingleton(AbortInvestment, [InvestmentsRepository, InvestmentFeeService, 'InvestmentsTransactionalAdapter']);
    container.addSingleton(CancelInvestment, [InvestmentsRepository, SimpleEventBus, InvestmentFeeService, 'InvestmentsTransactionalAdapter']);
    container.addSingleton(ListInvestmentsQuery, [InvestmentsRepository]);
    container.addSingleton(GenerateSubscriptionAgreement, [SubscriptionAgreementRepository]);
    container.addSingleton(MarkSubscriptionAgreementAsGenerated, [SubscriptionAgreementRepository]);
    container.addSingleton(TransferInvestments, [InvestmentsRepository, SharesAndDividendService, IdGenerator]);
  }
}
