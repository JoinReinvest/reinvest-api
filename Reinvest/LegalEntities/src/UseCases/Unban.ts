import { BanRepository } from 'LegalEntities/Adapter/Database/Repository/BanRepository';
import { IdentityService } from 'LegalEntities/Adapter/Modules/IdentityService';
import { storeEventCommand } from 'SimpleAggregator/EventBus/EventBus';

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

    if (bannedEntity.type === 'PROFILE') {
      await this.banRepository.publishEvents([storeEventCommand(bannedEntity.profileId, 'ProfileUnbanned', {})]);
    } else {
      await this.banRepository.publishEvents([storeEventCommand(bannedEntity.profileId, 'AccountUnbanned', { accountId: bannedEntity.accountId! })]);
    }
    return true;
  }
}
