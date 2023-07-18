import { UUID } from 'HKEKTypes/Generics';
import { Identity } from 'Identity/index';
import { GlobalValues } from 'Notifications/Domain/StoredEvent';

export class IdentityService {
  public static getClassName = (): string => 'IdentityService';
  private identityModule: Identity.Main;

  constructor(identityModule: Identity.Main) {
    this.identityModule = identityModule;
  }

  async getUserData(profileId: UUID): Promise<GlobalValues | null> {
    return this.identityModule.api().getUserData(profileId);
  }
}
