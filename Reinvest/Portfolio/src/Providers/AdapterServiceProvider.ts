import { ContainerInterface } from 'Container/Container';
import { createPortfolioDatabaseAdapterProvider, PortfolioDatabaseAdapterInstanceProvider } from 'Portfolio/Adapter/Database/DatabaseAdapter';
import { PortfolioRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioRepository';
import { Portfolio } from 'Portfolio/index';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';

import { DealpathAdapter } from '../Adapter/Dealpath/DealpathAdapter';

export class AdapterServiceProvider {
  private config: Portfolio.Config;

  constructor(config: Portfolio.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container
      .addAsValue(SimpleEventBus.getClassName(), new SimpleEventBus(container))
      .addObjectFactory(QueueSender, () => new QueueSender(this.config.queue), [])
      .addObjectFactory(SendToQueueEventHandler, (queueSender: QueueSender) => new SendToQueueEventHandler(queueSender), [QueueSender]);

    // db
    container
      .addAsValue(PortfolioDatabaseAdapterInstanceProvider, createPortfolioDatabaseAdapterProvider(this.config.database))
      .addSingleton(PortfolioRepository, [PortfolioDatabaseAdapterInstanceProvider]);

    // dealpath
    container.addAsValue('DealpathConfig', this.config.dealpathConfig).addSingleton(DealpathAdapter, ['DealpathConfig']);
  }
}
