import { ContainerInterface } from 'Container/Container';
import { IdentityService } from 'LegalEntities/Adapter/Modules/IdentityService';
import { LegalEntities } from 'LegalEntities/index';
import { BanEventHandler } from 'LegalEntities/Port/Events/BanEventHandler';
import { ProfileNameUpdatedEventHandler } from 'LegalEntities/Port/Events/ProfileNameUpdatedEventHandler';
import { Ban } from 'LegalEntities/UseCases/Ban';
import { EventBus, SimpleEventBus, STORE_EVENT_COMMAND } from 'SimpleAggregator/EventBus/EventBus';
import { SendToQueueEventHandler } from 'SimpleAggregator/EventBus/SendToQueueEventHandler';

export default class EventBusProvider {
  private config: LegalEntities.Config;

  constructor(config: LegalEntities.Config) {
    this.config = config;
  }

  public boot(container: ContainerInterface) {
    const eventBus = container.getValue(SimpleEventBus.getClassName()) as EventBus;
    container.addSingleton(BanEventHandler, [Ban]);
    container.addSingleton(ProfileNameUpdatedEventHandler, [IdentityService]);

    eventBus.subscribe('ProfileNameUpdated', ProfileNameUpdatedEventHandler.getClassName());
    eventBus.subscribeHandlerForKinds(SendToQueueEventHandler.getClassName(), [
      STORE_EVENT_COMMAND,
      'LegalProfileCompleted',
      'LegalEntityDocumentRemoved',
      'LegalEntityAvatarRemoved',
      'SensitiveDataUpdated',
      'DisableRecurringInvestment',
      'DisableAllRecurringInvestment',
    ]);
  }
}
