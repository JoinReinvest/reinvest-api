import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { ReinvestmentExecutor } from 'Investments/Application/ReinvestmentProcessManager/ReinvestmentExecutor';
import { TransactionExecutor } from 'Investments/Application/TransactionProcessManager/TransactionExecutor';
import { Investments } from 'Investments/index';
import { DocumentsService } from 'Investments/Infrastructure/Adapters/Modules/DocumentsService';
import { PortfolioService } from 'Investments/Infrastructure/Adapters/Modules/PortfolioService';
import { SharesAndDividendService } from 'Investments/Infrastructure/Adapters/Modules/SharesAndDividendService';
import { SubscriptionAgreementDataCollector } from 'Investments/Infrastructure/Adapters/Modules/SubscriptionAgreementDataCollector';
import { VerificationService } from 'Investments/Infrastructure/Adapters/Modules/VerificationService';
import {
  createInvestmentsDatabaseAdapterProvider,
  InvestmentsDatabase,
  InvestmentsDatabaseAdapterInstanceProvider,
  InvestmentsDatabaseAdapterProvider,
} from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { FeesRepository } from 'Investments/Infrastructure/Adapters/Repository/FeesRepository';
import { InvestmentsQueryRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsQueryRepository';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { RecurringInvestmentExecutionRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestmentExecutionRepository';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { ReinvestmentRepository } from 'Investments/Infrastructure/Adapters/Repository/ReinvestmentRepository';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { TransactionRepository } from 'Investments/Infrastructure/Adapters/Repository/TransactionRepository';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { GeneratePdfEventHandler } from 'SimpleAggregator/EventBus/GeneratePdfEventHandler';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';

export default class AdaptersProviders {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);
    container
      .addAsValue(SimpleEventBus.getClassName(), new SimpleEventBus(container))
      .addObjectFactory(QueueSender, () => new QueueSender(this.config.queue), [])
      .addObjectFactory(SendToQueueEventHandler, (queueSender: QueueSender) => new SendToQueueEventHandler(queueSender), [QueueSender])
      .addObjectFactory('PdfGeneratorQueueSender', () => new QueueSender(this.config.pdfGeneratorQueue), [])
      .addObjectFactory(GeneratePdfEventHandler, (queueSender: QueueSender) => new GeneratePdfEventHandler(queueSender), ['PdfGeneratorQueueSender']);

    // database
    container
      .addAsValue(InvestmentsDatabaseAdapterInstanceProvider, createInvestmentsDatabaseAdapterProvider(this.config.database))
      .addSingleton(FeesRepository, [InvestmentsDatabaseAdapterInstanceProvider])
      .addSingleton(InvestmentsRepository, [InvestmentsDatabaseAdapterInstanceProvider, FeesRepository, SimpleEventBus])
      .addSingleton(SubscriptionAgreementRepository, [InvestmentsDatabaseAdapterInstanceProvider, SimpleEventBus])
      .addSingleton(TransactionRepository, [InvestmentsDatabaseAdapterInstanceProvider, IdGenerator])
      .addSingleton(InvestmentsQueryRepository, [InvestmentsDatabaseAdapterInstanceProvider])
      .addSingleton(RecurringInvestmentsRepository, [InvestmentsDatabaseAdapterInstanceProvider, SimpleEventBus])
      .addSingleton(ReinvestmentRepository, [InvestmentsDatabaseAdapterInstanceProvider, IdGenerator])
      .addSingleton(InvestmentsQueryRepository, [InvestmentsDatabaseAdapterInstanceProvider])
      .addSingleton(RecurringInvestmentExecutionRepository, [InvestmentsDatabaseAdapterInstanceProvider])
      .addObjectFactory(
        'InvestmentsTransactionalAdapter',
        (databaseProvider: InvestmentsDatabaseAdapterProvider) => new TransactionalAdapter<InvestmentsDatabase>(databaseProvider),
        [InvestmentsDatabaseAdapterInstanceProvider],
      );

    container
      .addSingleton(SharesAndDividendService, ['SharesAndDividends'])
      .addSingleton(DocumentsService, ['Documents'])
      .addSingleton(VerificationService, ['Verification'])
      .addSingleton(PortfolioService, ['Portfolio'])
      .addSingleton(SubscriptionAgreementDataCollector, ['LegalEntities', 'Portfolio']);

    // process manager
    container.addSingleton(TransactionExecutor, [SimpleEventBus]);
    container.addSingleton(ReinvestmentExecutor, [SimpleEventBus]);
  }
}
