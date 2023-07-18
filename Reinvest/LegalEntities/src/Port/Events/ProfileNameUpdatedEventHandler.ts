import { IdentityService } from 'LegalEntities/Adapter/Modules/IdentityService';
import { EventHandler } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export class ProfileNameUpdatedEventHandler implements EventHandler<DomainEvent> {
  private identityService: IdentityService;

  constructor(identityService: IdentityService) {
    this.identityService = identityService;
  }

  static getClassName = (): string => 'ProfileNameUpdatedEventHandler';

  public async handle(event: DomainEvent): Promise<void> {
    if (!['ProfileNameUpdated'].includes(event.kind)) {
      return;
    }

    const { profileId, label } = event.data;
    await this.identityService.setUserLabel(profileId, label);
  }
}
