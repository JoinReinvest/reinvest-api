import { ContainerInterface } from 'Container/Container';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';

import { Investments } from '../..';

export default class EventBusProvider {
  private config: Investments.Config;

  constructor(config: Investments.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
    // eventBus
    //     .subscribe('ProfileSnapshotChanged', ProfileQueryEventHandler.getClassName())
  }
}
