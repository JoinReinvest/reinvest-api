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
}
