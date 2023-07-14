import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';
import {
  createSharesAndDividendsDatabaseAdapterProvider,
  SharesAndDividendsDatabase,
  SharesAndDividendsDatabaseAdapterInstanceProvider,
  SharesAndDividendsDatabaseAdapterProvider,
} from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { ConfigurationRepository } from 'SharesAndDividends/Adapter/Database/Repository/ConfigurationRepository';
import { DividendsCalculationRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsCalculationRepository';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { FinancialOperationsRepository } from 'SharesAndDividends/Adapter/Database/Repository/FinancialOperationsRepository';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
import { NotificationService } from 'SharesAndDividends/Adapter/Modules/NotificationService';
import { PortfolioService } from 'SharesAndDividends/Adapter/Modules/PortfolioService';
import { SharesAndDividends } from 'SharesAndDividends/index';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';

export class AdapterServiceProvider {
  private config: SharesAndDividends.Config;

  constructor(config: SharesAndDividends.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(IdGenerator);
    container
      .addAsValue(SimpleEventBus.getClassName(), new SimpleEventBus(container))
      .addObjectFactory(QueueSender, () => new QueueSender(this.config.queue), [])
      .addObjectFactory(SendToQueueEventHandler, (queueSender: QueueSender) => new SendToQueueEventHandler(queueSender), [QueueSender]);

    // db
    container
      .addAsValue(SharesAndDividendsDatabaseAdapterInstanceProvider, createSharesAndDividendsDatabaseAdapterProvider(this.config.database))
      .addSingleton(SharesRepository, [SharesAndDividendsDatabaseAdapterInstanceProvider])
      .addSingleton(FinancialOperationsRepository, [SharesAndDividendsDatabaseAdapterInstanceProvider, IdGenerator])
      .addSingleton(DividendsRepository, [SharesAndDividendsDatabaseAdapterInstanceProvider])
      .addSingleton(DividendsCalculationRepository, [SharesAndDividendsDatabaseAdapterInstanceProvider])
      .addObjectFactory(
        'SharesAndDividendsTransactionalAdapter',
        (databaseProvider: SharesAndDividendsDatabaseAdapterProvider) => new TransactionalAdapter<SharesAndDividendsDatabase>(databaseProvider),
        [SharesAndDividendsDatabaseAdapterInstanceProvider],
      );
    container.addSingleton(PortfolioService, ['Portfolio']);
    container.addSingleton(NotificationService, ['Notifications']);
    container.addSingleton(ConfigurationRepository, [SharesAndDividendsDatabaseAdapterInstanceProvider]);
  }
}
