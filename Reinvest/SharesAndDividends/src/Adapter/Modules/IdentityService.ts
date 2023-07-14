import { UUID } from 'HKEKTypes/Generics';
import { Identity } from 'Identity/index';

export class IdentityService {
  private identityModule: Identity.Main;

  constructor(identityModule: Identity.Main) {
    this.identityModule = identityModule;
  }

  static getClassName = () => 'IdentityService';

  async getUserInviter(profileId: UUID): Promise<UUID | null> {
    return this.identityModule.api().getUserInviter(profileId);
  }
}
