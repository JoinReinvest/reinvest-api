import { UUID } from 'HKEKTypes/Generics';
import { CognitoService } from 'Identity/Adapter/AWS/CognitoService';
import { UserRepository } from 'Identity/Adapter/Database/Repository/UserRepository';
import { BanList } from 'Identity/Port/Api/BanController';

export type UserProfile = {
  isBannedAccount: (accountId: string) => boolean;
  isBannedProfile: () => boolean;
  profileId: string;
};

export class ProfileController {
  private userRepository: UserRepository;
  private cognitoService: CognitoService;

  constructor(userRepository: UserRepository, cognitoService: CognitoService) {
    this.userRepository = userRepository;
    this.cognitoService = cognitoService;
  }

  public static getClassName = (): string => 'ProfileController';

  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const user = await this.userRepository.getUserProfile(userId);

      if (!user) {
        return null;
      }

      const banList = <BanList>(user.bannedIdsJson ?? { list: [] });

      return {
        profileId: user.profileId,
        isBannedAccount: (accountId: string) => banList.list.includes(accountId),
        isBannedProfile: () => banList.list.includes(user.profileId),
      };
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

  async getPhoneAndEmailData(profileId: UUID): Promise<{ email: string; phoneNumber: string }> {
    const user = await this.userRepository.findUserByProfileId(profileId);

    if (!user) {
      throw new Error('User not found');
    }

    const { email, cognitoUserId } = user;
    const phoneNumber = await this.cognitoService.getPhoneNumber(cognitoUserId);

    return {
      email,
      phoneNumber: phoneNumber ?? '',
    };
  }
}
