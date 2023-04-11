export class QueryProfileRepository {
  static getClassName = (): string => 'QueryProfileRepository';
}

class ProfileQueryService {
  private repository: QueryProfileRepository;

  constructor(repository: QueryProfileRepository) {
    this.repository = repository;
  }

  static getClassName = (): string => 'ProfileQueryService';

  async getProfileByUserId(userId: string) {
    // const profileQuery = new ProfileQuery(); // inject!
    // const profile = await profileQuery.getQuery({userId});
    // if (!profile) {
    //     return {};
    // }
    //
    // return profile.data;
  }
}

export default ProfileQueryService;
