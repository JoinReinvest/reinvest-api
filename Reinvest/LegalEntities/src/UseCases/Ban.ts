import { AccountRepository } from 'LegalEntities/Adapter/Database/Repository/AccountRepository';
import { BanRepository } from 'LegalEntities/Adapter/Database/Repository/BanRepository';
import { ProfileRepository } from 'LegalEntities/Adapter/Database/Repository/ProfileRepository';
import { IdentityService } from 'LegalEntities/Adapter/Modules/IdentityService';
import { BannedType } from 'LegalEntities/Domain/BannedEntity';
import { SensitiveNumberSchema } from 'LegalEntities/Domain/ValueObject/SensitiveNumber';
import { DateTime } from 'Money/DateTime';
import { DomainEvent } from 'SimpleAggregator/Types';

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

  async banAccountByCompany(accountId: any, reasons: any): Promise<void> {
    const account = await this.accountRepository.findCompanyAccountByAccountId(accountId);

    if (!account) {
      console.error(`Banning account ${accountId} failed: company account not found`);

      return;
    }

    const accountSchema = account.toObject();
    const ein = accountSchema.einHash;
    const einAnonymized = accountSchema.ein.anonymized;
    const profileId = accountSchema.profileId;

    await this.banRepository.addBannedRecord(
      {
        profileId,
        accountId,
        stakeholderId: null,
        type: BannedType.COMPANY,
        reasons: Array.isArray(reasons) ? reasons.join(', ') : reasons,
        dateCreated: DateTime.now().toDate(),
        dateCancelled: null,
        sensitiveNumber: ein ?? '',
        anonymizedSensitiveNumber: einAnonymized ?? '',
        status: 'ACTIVE',
      },
      [
        <DomainEvent>{
          kind: 'DisableRecurringInvestment',
          id: accountId,
          data: {
            accountId,
            profileId,
          },
        },
      ],
    );

    await this.identityService.addBannedId(profileId, accountId);

    return;
  }

  async banAccountByStakeholder(accountId: any, stakeholderId: any, reasons: any): Promise<void> {
    const account = await this.accountRepository.findCompanyAccountByAccountId(accountId);

    if (!account) {
      console.error(`Banning stakeholder ${accountId} for account ${accountId} failed: company account not found`);

      return;
    }

    const accountSchema = account.toObject();
    const profileId = accountSchema.profileId;
    const stakeholder = account.getStakeholderById(stakeholderId);

    if (!stakeholder) {
      console.error(`Banning stakeholder ${stakeholderId} for account ${accountId} failed: stakeholder not found in account`);
    }

    const stakeholderSchema = stakeholder!.toObject();
    const ssn = (<SensitiveNumberSchema>stakeholderSchema.ssn).hashed;
    const ssnAnonymized = (<SensitiveNumberSchema>stakeholderSchema.ssn).anonymized;

    await this.banRepository.addBannedRecord(
      {
        profileId,
        accountId,
        stakeholderId,
        type: BannedType.STAKEHOLDER,
        reasons: Array.isArray(reasons) ? reasons.join(', ') : reasons,
        dateCreated: DateTime.now().toDate(),
        dateCancelled: null,
        sensitiveNumber: ssn ?? '',
        anonymizedSensitiveNumber: ssnAnonymized ?? '',
        status: 'ACTIVE',
      },
      [
        <DomainEvent>{
          kind: 'DisableRecurringInvestment',
          id: accountId,
          data: {
            accountId,
            profileId,
          },
        },
      ],
    );

    await this.identityService.addBannedId(profileId, accountId);

    return;
  }

  async banProfile(profileId: any, reasons: any): Promise<void> {
    const profile = await this.profileRepository.findProfile(profileId);

    if (!profile) {
      console.error(`Banning profile ${profileId} failed: profile not found`);

      return;
    }

    const profileObject = profile.toObject();
    const ssn = profileObject.ssnObject?.hashed;
    const ssnAnonymized = profileObject.ssnObject?.anonymized;

    await this.banRepository.addBannedRecord(
      {
        profileId,
        accountId: null,
        stakeholderId: null,
        type: BannedType.PROFILE,
        reasons: Array.isArray(reasons) ? reasons.join(', ') : reasons,
        dateCreated: DateTime.now().toDate(),
        dateCancelled: null,
        sensitiveNumber: ssn ?? '',
        anonymizedSensitiveNumber: ssnAnonymized ?? '',
        status: 'ACTIVE',
      },
      [
        <DomainEvent>{
          kind: 'DisableAllRecurringInvestment',
          id: profileId,
          data: {
            profileId,
          },
        },
      ],
    );

    await this.identityService.addBannedId(profileId, profileId);

    return;
  }

  async banUser(profileId: string, reason: string): Promise<boolean> {
    const profile = await this.profileRepository.findProfile(profileId);

    if (!profile) {
      console.error(`Banning profile ${profileId} failed: profile not found`);

      return false;
    }

    const profileObject = profile.toObject();
    const ssn = profileObject.ssnObject?.hashed;
    const ssnAnonymized = profileObject.ssnObject?.anonymized;

    await this.banRepository.addBannedRecord(
      {
        profileId,
        accountId: null,
        stakeholderId: null,
        type: BannedType.PROFILE,
        reasons: reason,
        dateCreated: DateTime.now().toDate(),
        dateCancelled: null,
        sensitiveNumber: ssn ?? '',
        anonymizedSensitiveNumber: ssnAnonymized ?? '',
        status: 'ACTIVE',
      },
      [
        <DomainEvent>{
          kind: 'DisableAllRecurringInvestment',
          id: profileId,
          data: {
            profileId,
          },
        },
      ],
    );

    await this.identityService.addBannedId(profileId, profileId);

    return true;
  }

  async banAccount(accountId: string, reason: string): Promise<boolean> {
    const account = await this.accountRepository.findCompanyAccountByAccountId(accountId);

    if (!account) {
      console.error(`Banning account ${accountId} failed: company account not found`);

      return false;
    }

    const accountSchema = account.toObject();
    const ein = accountSchema.einHash;
    const einAnonymized = accountSchema.ein.anonymized;
    const profileId = accountSchema.profileId;

    await this.banRepository.addBannedRecord(
      {
        profileId,
        accountId,
        stakeholderId: null,
        type: BannedType.COMPANY,
        reasons: reason,
        dateCreated: DateTime.now().toDate(),
        dateCancelled: null,
        sensitiveNumber: ein ?? '',
        anonymizedSensitiveNumber: einAnonymized ?? '',
        status: 'ACTIVE',
      },
      [
        <DomainEvent>{
          kind: 'DisableRecurringInvestment',
          id: accountId,
          data: {
            accountId,
            profileId,
          },
        },
      ],
    );

    await this.identityService.addBannedId(profileId, accountId);

    return true;
  }
}
