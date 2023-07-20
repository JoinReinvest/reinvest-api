import { BanRepository } from 'LegalEntities/Adapter/Database/Repository/BanRepository';
import { IdentityService } from 'LegalEntities/Adapter/Modules/IdentityService';

export class Unban {
  public static getClassName = (): string => 'Unban';
  private banRepository: BanRepository;
  private identityService: IdentityService;

  constructor(banRepository: BanRepository, identityService: IdentityService) {
    this.banRepository = banRepository;
    this.identityService = identityService;
  }

  async unban(banId: string): Promise<boolean> {
    const bannedEntity = await this.banRepository.findBannedEntityById(banId);

    if (!bannedEntity) {
      return false;
    }

    await this.banRepository.unban(bannedEntity.id);
    const bannedId = bannedEntity.type === 'PROFILE' ? bannedEntity.profileId : bannedEntity.accountId!;
    await this.identityService.removeBannedId(bannedEntity.profileId, bannedId);

    return true;
  }
}
