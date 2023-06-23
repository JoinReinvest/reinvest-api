import { ContainerInterface } from 'Container/Container';
import { LegalEntities } from 'LegalEntities/index';
import { BanEventHandler } from 'LegalEntities/Port/Events/BanEventHandler';
import { Ban } from 'LegalEntities/UseCases/Ban';
import { EventBus, SimpleEventBus } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';

export default class EventBusProvider {
  private config: LegalEntities.Config;

  constructor(config: LegalEntities.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
    container.addSingleton(BanEventHandler, [Ban]);

    eventBus.subscribeHandlerForKinds(SendToQueueEventHandler.getClassName(), [
      'LegalProfileCompleted',
      'LegalEntityDocumentRemoved',
      'LegalEntityAvatarRemoved',
      'SensitiveDataUpdated',
    ]);
  }
}
