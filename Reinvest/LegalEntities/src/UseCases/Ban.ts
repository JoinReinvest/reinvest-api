import { AccountRepository } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { BannedType, BanRepository } from 'LegalEntities/Adapter/Database/Repository/BanRepository';
import { ProfileRepository } from 'LegalEntities/Adapter/Database/Repository/ProfileRepository';
import { IdentityService } from 'LegalEntities/Adapter/Modules/IdentityService';

export class Ban {
  public static getClassName = (): string => 'Ban';
  private accountRepository: AccountRepository;
  private profileRepository: ProfileRepository;
  private banRepository: BanRepository;
  private identityService: IdentityService;

  constructor(accountRepository: AccountRepository, profileRepository: ProfileRepository, banRepository: BanRepository, identityService: IdentityService) {
    this.accountRepository = accountRepository;
    this.profileRepository = profileRepository;
    this.banRepository = banRepository;
    this.identityService = identityService;
  }

  async banAccountByCompany(accountId: any, reasons: any): Promise<void> {}

  async banAccountByStakeholder(accountId: any, stakeholderId: any, reasons: any): Promise<void> {
    return;
  }

  async banProfile(profileId: any, reasons: any): Promise<void> {
    const profile = await this.profileRepository.findProfile(profileId);

    if (!profile) {
      console.error(`Banning profile ${profileId} failed: profile not found`);

      return;
    }

    const profileObject = profile.toObject();
    const ssn = profileObject.ssn;

    await this.banRepository.addBannedRecord({
      profileId,
      accountId: null,
      stakeholderId: null,
      type: BannedType.PROFILE,
      reasons: Array.isArray(reasons) ? reasons.join(', ') : reasons,
      dateCreated: new Date(),
      dateCancelled: null,
      sensitiveNumber: ssn ?? '',
      status: 'ACTIVE',
    });

    await this.identityService.addBannedId(profileId, profileId);

    return;
  }
}
