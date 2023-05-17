import { ContainerInterface } from 'Container/Container';
import { InvestmentCreatedHandler } from 'Investments/Application/DomainEventHandler/InvestmentCreatedHandler';
import { TransactionEvents } from 'Investments/Domain/Transaction/TransactionEvents';
import { TransactionRepository } from 'Investments/Infrastructure/Adapters/Repository/TransactionRepository';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';

import { Investments } from '../..';

export default class EventBusProvider {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;

    container.addSingleton(InvestmentCreatedHandler, [TransactionRepository]);

    eventBus.subscribe(TransactionEvents.INVESTMENT_CREATED, InvestmentCreatedHandler.getClassName());
  }
}
