import {DbProvider} from "InvestmentAccounts/Storage/DatabaseAdapter";
import {ProfileQuery} from "InvestmentAccounts/Storage/Queries/ProfileQuery";

export class QueryProfileRepository {
    static toString = () => "QueryProfileRepository";
}

class ProfileQueryService {
    static toString = () => "ProfileQueryService";
    private repository: QueryProfileRepository;


    constructor(repository: QueryProfileRepository) {
        this.repository = repository;
    }

    async getProfileByUserId(userId: string) {
        const profileQuery = new ProfileQuery(); // inject!
        const profile = await profileQuery.getQuery({userId});
        if (!profile) {
            return {};
        }

        return profile.data;
    }
}

export default ProfileQueryService;
