import { AccountType } from 'InvestmentAccounts/Domain/ProfileAggregate/AccountType';
import { ProfileException } from 'InvestmentAccounts/Domain/ProfileAggregate/ProfileException';
import { ProfileRepository } from 'InvestmentAccounts/Infrastructure/Storage/Repository/ProfileRepository';

export class OpenAccount {
  private readonly profileRepository: ProfileRepository;

  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository;
  }

  static getClassName = (): string => 'OpenAccount';

  async execute(profileId: string, accountId: string, accountType: AccountType): Promise<void | never> {
    const profile = await this.profileRepository.restore(profileId);

    if (profile === null) {
      throw new ProfileException(`Profile ${profileId} not exist`);
    }

    const events = [];

    switch (accountType) {
      case AccountType.INDIVIDUAL:
        events.push(profile.openIndividualAccount(accountId));
        break;
      case AccountType.CORPORATE:
        events.push(profile.openCorporateAccount(accountId));
        break;
      case AccountType.TRUST:
        events.push(profile.openTrustAccount(accountId));
        break;
      default:
        ProfileException.throw(`Unknown account type: ${accountType}`);
        break;
    }

    await this.profileRepository.storeAndPublish(events, profile.getSnapshot());
  }

  async listAccountTypesUserCanOpen(profileId: string): Promise<AccountType[]> {
    const profile = await this.profileRepository.restore(profileId);

    if (profile === null) {
      throw new ProfileException(`Profile ${profileId} not exist`);
    }

    return profile.listAccountTypesUserCanOpen();
  }
}
