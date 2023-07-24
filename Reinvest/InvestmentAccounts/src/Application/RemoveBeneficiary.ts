import { AccountType } from 'InvestmentAccounts/Domain/ProfileAggregate/AccountType';
import { ProfileException } from 'InvestmentAccounts/Domain/ProfileAggregate/ProfileException';
import { ProfileRepository } from 'InvestmentAccounts/Infrastructure/Storage/Repository/ProfileRepository';

export class RemoveBeneficiary {
  private readonly profileRepository: ProfileRepository;

  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository;
  }

  static getClassName = (): string => 'RemoveBeneficiary';

  async execute(profileId: string, accountId: string): Promise<void> {
    const profile = await this.profileRepository.restore(profileId);

    if (!profile) {
      throw new ProfileException(`Profile ${profileId} not exist`);
    }

    if (!accountId) {
      throw new ProfileException(`Account id is null`);
    }

    const event = profile.removeBeneficiaryAccount(accountId);
    await this.profileRepository.storeAndPublish([event], profile.getSnapshot());
  }

  async listAccountTypesUserCanOpen(profileId: string): Promise<AccountType[]> {
    const profile = await this.profileRepository.restore(profileId);

    if (profile === null) {
      throw new ProfileException(`Profile ${profileId} not exist`);
    }

    return profile.listAccountTypesUserCanOpen();
  }
}
