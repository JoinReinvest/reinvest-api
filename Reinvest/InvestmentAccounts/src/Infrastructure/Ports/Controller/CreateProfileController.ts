import CreateProfile from 'InvestmentAccounts/Application/CreateProfile';

export class CreateProfileController {
  private createProfile: CreateProfile;

  constructor(createProfile: CreateProfile) {
    this.createProfile = createProfile;
  }

  public static getClassName = (): string => 'CreateProfileController';

  async execute(profileId: string): Promise<boolean> {
    try {
      await this.createProfile.execute(profileId);
    } catch (error: any) {
      console.log(error.message);

      return false;
    }

    return true;
  }
}
