import { ContainerInterface } from 'Container/Container';
import { FinancialOperationsRepository } from 'SharesAndDividends/Adapter/Database/Repository/FinancialOperationsRepository';
import { SharesAndDividends } from 'SharesAndDividends/index';
import { NavUpdateEventHandler } from 'SharesAndDividends/Port/Queue/NavUpdateEventHandler';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';

export default class EventBusProvider {
  private config: SharesAndDividends.Config;

  constructor(config: SharesAndDividends.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    container.addSingleton(NavUpdateEventHandler, [FinancialOperationsRepository]);

    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
  }
}
