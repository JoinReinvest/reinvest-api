import { CognitoService } from 'Identity/Adapter/AWS/CognitoService';
import { UserRepository } from 'Identity/Adapter/Database/Repository/UserRepository';

export class ProfileController {
  private userRepository: UserRepository;
  private cognitoService: CognitoService;

  constructor(userRepository: UserRepository, cognitoService: CognitoService) {
    this.userRepository = userRepository;
    this.cognitoService = cognitoService;
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

  async updateEmailAddress(userId: string) {
    try {
      const isNewEmailVerified = await this.cognitoService.isEmailVerified(userId);

      if (!isNewEmailVerified) {
        return false;
      }

      const newEmail = await this.cognitoService.getEmail(userId);

      if (!newEmail) {
        return false;
      }

      await this.userRepository.updateUserEmail(userId, newEmail);

      return true;
    } catch (error: any) {
      console.log(error.message);

      return null;
    }
  }
}
