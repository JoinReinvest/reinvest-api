import { ContainerInterface } from 'Container/Container';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { Verification } from 'Verification/index';

export default class EventBusProvider {
  private config: Verification.Config;

  constructor(config: Verification.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    // const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
  }
}
