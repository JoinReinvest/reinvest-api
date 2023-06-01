import { UserRepository } from 'Identity/Adapter/Database/Repository/UserRepository';

export class ProfileController {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public static getClassName = (): string => 'ProfileController';

  async getProfileId(userId: string): Promise<string | null> {
    try {
      const profileId = await this.userRepository.getUserProfileId(userId);

      return profileId;
    } catch (error: any) {
      console.log(error.message);

      return null;
    }
  }

  async getProfileByEmail(email: string): Promise<{ profileId: string } | null> {
    try {
      const profileId = await this.userRepository.getUserProfileByEmail(email);

      if (!profileId) {
        return null;
      }

      return { profileId };
    } catch (error: any) {
      console.log(error.message);

      return null;
    }
  }
}
