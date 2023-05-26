import { ContainerInterface } from 'Container/Container';
import { IdGenerator } from 'IdGenerator/IdGenerator';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';
import {
  createSharesAndDividendsDatabaseAdapterProvider,
  SharesAndDividendsDatabaseAdapterInstanceProvider,
} from 'SharesAndDividends/Adapter/Database/DatabaseAdapter';
import { DividendsRepository } from 'SharesAndDividends/Adapter/Database/Repository/DividendsRepository';
import { SharesRepository } from 'SharesAndDividends/Adapter/Database/Repository/SharesRepository';
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
      .addSingleton(DividendsRepository, [SharesAndDividendsDatabaseAdapterInstanceProvider]);

    container.addSingleton(PortfolioService, ['Portfolio']);
  }
}
