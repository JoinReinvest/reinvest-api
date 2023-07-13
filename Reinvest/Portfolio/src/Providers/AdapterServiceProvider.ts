import { ContainerInterface } from 'Container/Container';
import { createPortfolioDatabaseAdapterProvider, PortfolioDatabaseAdapterInstanceProvider } from 'Portfolio/Adapter/Database/DatabaseAdapter';
import { PortfolioNavRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioNavRepository';
import { PortfolioRepository } from 'Portfolio/Adapter/Database/Repository/PortfolioRepository';
import { PropertyRepository } from 'Portfolio/Adapter/Database/Repository/PropertyRepository';
import { DealpathAdapter } from 'Portfolio/Adapter/Dealpath/DealpathAdapter';
import { DocumentsService } from 'Portfolio/Adapter/Documents/DocumentsService';
import { PortfolioNorthCapitalAdapter } from 'Portfolio/Adapter/NorthCapital/PortfolioNorthCapitalAdapter';
import { PortfolioVertaloAdapter } from 'Portfolio/Adapter/Vertalo/PortfolioVertaloAdapter';
import { Portfolio } from 'Portfolio/index';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';

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
      .addSingleton(PropertyRepository, [PortfolioDatabaseAdapterInstanceProvider, SimpleEventBus])
      .addSingleton(PortfolioRepository, [PortfolioDatabaseAdapterInstanceProvider])
      .addSingleton(PortfolioNavRepository, [PortfolioDatabaseAdapterInstanceProvider]);

    container.addSingleton(DocumentsService, ['Documents']);

    // dealpath
    container.addAsValue('DealpathConfig', this.config.dealpathConfig).addSingleton(DealpathAdapter, ['DealpathConfig']);
    container.addAsValue('NorthCapitalConfig', this.config.northCapital).addSingleton(PortfolioNorthCapitalAdapter, ['NorthCapitalConfig']);
    container.addAsValue('VertaloConfig', this.config.vertalo).addSingleton(PortfolioVertaloAdapter, ['VertaloConfig']);
  }
}
