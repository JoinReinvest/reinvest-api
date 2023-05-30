import { ContainerInterface } from 'Container/Container';
import { SharesAndDividends } from 'SharesAndDividends/index';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';

export default class EventBusProvider {
  private config: SharesAndDividends.Config;

  constructor(config: SharesAndDividends.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
  }
}
