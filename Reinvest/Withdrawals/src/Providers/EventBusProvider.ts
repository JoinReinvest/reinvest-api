import { ContainerInterface } from 'Container/Container';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { Withdrawals } from 'Withdrawals/index';

export default class EventBusProvider {
  private config: Withdrawals.Config;

  constructor(config: Withdrawals.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
  }
}
