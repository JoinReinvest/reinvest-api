import Profile from 'InvestmentAccounts/Domain/ProfileAggregate/Profile';
import { ProfileException } from 'InvestmentAccounts/Domain/ProfileAggregate/ProfileException';
import { ProfileRepository } from 'InvestmentAccounts/Infrastructure/Storage/Repository/ProfileRepository';

class CreateProfile {
  private readonly profileRepository: ProfileRepository;

  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository;
  }

  static getClassName = (): string => 'CreateProfile';

  async execute(profileId: string) {
    const checkIfExists = await this.profileRepository.restore(profileId);

    if (checkIfExists !== null) {
      throw new ProfileException(`Profile ${profileId} already exists`);
    }

    const profile = Profile.create(profileId);
    const profileCreated = profile.initialize();

    await this.profileRepository.storeAndPublish([profileCreated], profile.getSnapshot());
    console.log(`Profile ${profileId} created`);
  }
}

export default CreateProfile;
