import Profile from "./Profile";

export class QueryProfileRepository {
    static toString() {
        return 'QueryProfileRepository';
    }

}

class ProfileQuery {
    private repository: QueryProfileRepository;

    static toString() {
        return 'ProfileQuery';
    }

    constructor(repository: QueryProfileRepository) {
        this.repository = repository;
    }

    getProfileByUserId(userId: string) {
        return {
            id: 'someProfileId',
            userId,
            email: 'test',
            avatarUrl: 'https://s3.avatar.test.com',
        }
    }


}

export default ProfileQuery;