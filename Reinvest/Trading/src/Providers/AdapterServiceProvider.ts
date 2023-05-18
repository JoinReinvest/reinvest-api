import { ContainerInterface } from 'Container/Container';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';
import { createTradingDatabaseAdapterProvider, TradingDatabaseAdapterInstanceProvider } from 'Trading/Adapter/Database/DatabaseAdapter';
import { TradingNorthCapitalAdapter } from 'Trading/Adapter/NorthCapital/TradingNorthCapitalAdapter';
import { Trading } from 'Trading/index';

export class AdapterServiceProvider {
  private config: Trading.Config;

  constructor(config: Trading.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container
      .addAsValue(SimpleEventBus.getClassName(), new SimpleEventBus(container))
      .addObjectFactory(QueueSender, () => new QueueSender(this.config.queue), [])
      .addObjectFactory(SendToQueueEventHandler, (queueSender: QueueSender) => new SendToQueueEventHandler(queueSender), [QueueSender]);

    // db
    container.addAsValue(TradingDatabaseAdapterInstanceProvider, createTradingDatabaseAdapterProvider(this.config.database));

    // north capital
    container.addAsValue('NorthCapitalConfig', this.config.northCapital).addSingleton(TradingNorthCapitalAdapter, ['NorthCapitalConfig']);
  }
}
