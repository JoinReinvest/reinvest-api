import { Archiving } from 'Archiving/index';
import { ContainerInterface } from 'Container/Container';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';

export default class EventBusProvider {
  private config: Archiving.Config;

  constructor(config: Archiving.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
    // eventBus.subscribeHandlerForKinds(GeneratePdfEventHandler.getClassName(), ['MakeScreenshotToPdf']);
  }
}
