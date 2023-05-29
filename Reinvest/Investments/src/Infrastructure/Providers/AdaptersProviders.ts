import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { TransactionExecutor } from 'Investments/Application/TransactionProcessManager/TransactionExecutor';
import { Investments } from 'Investments/index';
import { SharesAndDividendService } from 'Investments/Infrastructure/Adapters/Modules/SharesAndDividendService';
import {
  createInvestmentsDatabaseAdapterProvider,
  InvestmentsDatabaseAdapterInstanceProvider,
} from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { FeesRepository } from 'Investments/Infrastructure/Adapters/Repository/FeesRepository';
import { InvestmentsQueryRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsQueryRepository';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { RecurringInvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/RecurringInvestments';
import { SubscriptionAgreementRepository } from 'Investments/Infrastructure/Adapters/Repository/SubscriptionAgreementRepository';
import { TransactionRepository } from 'Investments/Infrastructure/Adapters/Repository/TransactionRepository';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
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
      .addObjectFactory(SendToQueueEventHandler, (queueSender: QueueSender) => new SendToQueueEventHandler(queueSender), [QueueSender]);

    // database
    container
      .addAsValue(InvestmentsDatabaseAdapterInstanceProvider, createInvestmentsDatabaseAdapterProvider(this.config.database))
      .addSingleton(InvestmentsRepository, [InvestmentsDatabaseAdapterInstanceProvider, SimpleEventBus])
      .addSingleton(SubscriptionAgreementRepository, [InvestmentsDatabaseAdapterInstanceProvider])
      .addSingleton(FeesRepository, [InvestmentsDatabaseAdapterInstanceProvider])
      .addSingleton(TransactionRepository, [InvestmentsDatabaseAdapterInstanceProvider, IdGenerator])
      .addSingleton(InvestmentsQueryRepository, [InvestmentsDatabaseAdapterInstanceProvider])
      .addSingleton(RecurringInvestmentsRepository, [InvestmentsDatabaseAdapterInstanceProvider, SimpleEventBus]);

    container.addSingleton(SharesAndDividendService, ['SharesAndDividends']);

    // process manager
    container.addSingleton(TransactionExecutor, [SimpleEventBus]);
  }
}
