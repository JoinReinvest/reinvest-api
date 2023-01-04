import Profile from "InvestmentAccounts/Profile";
import {DbProvider} from "InvestmentAccounts/Storage/DatabaseAdapter";

export class QueryProfileRepository {
    static toString() {
        return "QueryProfileRepository";
    }
}

class ProfileQuery {
    private repository: QueryProfileRepository;

    static toString() {
        return "ProfileQuery";
    }

    constructor(repository: QueryProfileRepository) {
        this.repository = repository;
    }

    async getProfileByUserId(userId: string) {
        const database = DbProvider.provide();

        const profile = await database
            .selectFrom('investment_accounts_profile_aggregate')
            .select(['state'])
            .where('aggregateId', '=', 'testAggregateId')
            .executeTakeFirst()

        return profile.state;
    }
}

export default ProfileQuery;
