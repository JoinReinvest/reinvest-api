import { ContainerInterface } from 'Container/Container';
import { Investments } from 'Investments/index';
import {
  createInvestmentsDatabaseAdapterProvider,
  InvestmentsDatabaseAdapterInstanceProvider,
} from 'Investments/Infrastructure/Adapters/PostgreSQL/DatabaseAdapter';
import { InvestmentsRepository } from 'Investments/Infrastructure/Adapters/Repository/InvestmentsRepository';
import { TransactionRepository } from 'Investments/Infrastructure/Adapters/Repository/TransactionRepository';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';
import { SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';

import { SubscriptionAgreementRepository } from '../Adapters/Repository/SubscriptionAgreementRepository';

export default class AdaptersProviders {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container
      .addAsValue(SimpleEventBus.getClassName(), new SimpleEventBus(container))
      .addObjectFactory(QueueSender, () => new QueueSender(this.config.queue), [])
      .addObjectFactory(SendToQueueEventHandler, (queueSender: QueueSender) => new SendToQueueEventHandler(queueSender), [QueueSender]);

    // database
    container
      .addAsValue(InvestmentsDatabaseAdapterInstanceProvider, createInvestmentsDatabaseAdapterProvider(this.config.database))
      .addSingleton(InvestmentsRepository, [InvestmentsDatabaseAdapterInstanceProvider])
      .addSingleton(TransactionRepository, [InvestmentsDatabaseAdapterInstanceProvider])
      .addSingleton(SubscriptionAgreementRepository, [InvestmentsDatabaseAdapterInstanceProvider]);
  }
}
