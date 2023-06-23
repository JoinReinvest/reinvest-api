import { Identity } from "Identity/index";

/**
 * Identity Module ACL
 */
export class IdentityService {
  public static getClassName = () => 'IdentityService';
  private identityModule: Identity.Main;

  constructor(identityService: Identity.Main) {
    this.identityModule = identityService;
  }

  async addBannedId(profileId: string, bannedId: string): Promise<void> {
    await this.identityModule.api().addBannedId(profileId, bannedId);
  }
}
