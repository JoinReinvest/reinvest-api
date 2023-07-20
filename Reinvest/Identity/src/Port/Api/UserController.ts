import { Pagination, UUID } from 'HKEKTypes/Generics';
import { UserRepository } from 'Identity/Adapter/Database/Repository/UserRepository';

export type User = {
  createdAt: string;
  email: string;
  isBanned: boolean;
  profileId: UUID;
};

export class UserController {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  public static getClassName = (): string => 'UserController';

  async listUsers(pagination: Pagination): Promise<User[]> {
    return this.userRepository.listUsers(pagination);
  }
}
