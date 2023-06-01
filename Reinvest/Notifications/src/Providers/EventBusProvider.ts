import { ContainerInterface } from 'Container/Container';
import { Notifications } from 'Notifications/index';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';

export default class EventBusProvider {
  private config: Notifications.Config;

  constructor(config: Notifications.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
  }
}
