import { ContainerInterface } from 'Container/Container';
import { EventBus, SimpleEventBus, STORE_EVENT_COMMAND } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';
import { Withdrawals } from 'Withdrawals/index';

export default class EventBusProvider {
  private config: Withdrawals.Config;

  constructor(config: Withdrawals.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
    eventBus.subscribeHandlerForKinds(SendToQueueEventHandler.getClassName(), [STORE_EVENT_COMMAND, 'GeneratePdfCommand']);
  }
}
