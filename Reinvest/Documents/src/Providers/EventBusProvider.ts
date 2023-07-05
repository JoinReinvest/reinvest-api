import { ContainerInterface } from 'Container/Container';
import { Documents } from 'Documents/index';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { GeneratePdfEventHandler } from 'SimpleAggregator/EventBus/GeneratePdfEventHandler';

export default class EventBusProvider {
  private config: Documents.Config;

  constructor(config: Documents.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
    eventBus.subscribeHandlerForKinds(GeneratePdfEventHandler.getClassName(), ['MakeScreenshotToPdf']);
  }
}
