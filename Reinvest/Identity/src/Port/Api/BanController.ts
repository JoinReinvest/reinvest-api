import { UserRepository } from 'Identity/Adapter/Database/Repository/UserRepository';

export type BanList = {
  list: string[];
};

export class BanController {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public static getClassName = (): string => 'BanController';

  async addBannedId(profileId: string, bannedId: string): Promise<void> {
    const user = await this.userRepository.findUserByProfileId(profileId);

    if (!user) {
      return;
    }

    const banList = <BanList>(user.bannedIdsJson ?? { list: [] });

    if (banList.list.includes(bannedId)) {
      return;
    }

    banList.list.push(bannedId);
    await this.userRepository.updateUserBanList(user.id, banList);

    return;
  }

  async removeBannedId(profileId: string, bannedId: string): Promise<void> {
    const user = await this.userRepository.findUserByProfileId(profileId);

    if (!user) {
      return;
    }

    const banList = <BanList>(user.bannedIdsJson ?? { list: [] });

    if (!banList.list.includes(bannedId)) {
      return;
    }

    banList.list = banList.list.filter(id => id !== bannedId);
    await this.userRepository.updateUserBanList(user.id, banList);

    return;
  }
}
