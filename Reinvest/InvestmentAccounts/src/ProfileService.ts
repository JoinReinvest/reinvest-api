import Profile from "InvestmentAccounts/Profile";
import {DbProvider} from "InvestmentAccounts/Storage/DatabaseAdapter";


export class ProfileRepository {
    static toString() {
        return "ProfileRepository";
    }
}

class ProfileService {
    private readonly profileRepository: ProfileRepository;

    static toString() {
        return "ProfileService";
    }

    constructor(profileRepository: ProfileRepository) {
        this.profileRepository = profileRepository;
        console.log("now!");
    }

    async create(userId: string) {
        console.log("profile repository", this.profileRepository);
        const profile = Profile.create();
        const profileCreated = profile.initialize(userId);
        const database = DbProvider.provide();
        const aggregate = profile.getSnapshot();

        const {aggregateId} = await database
            .insertInto('investment_accounts_profile_aggregate')
            .values({...aggregate})
            .returning('aggregateId')
            .executeTakeFirstOrThrow()
        // console.log({aggregateId});
        // this.repository.transaction(() => {
        //     this.aggregateService.persist(profile);
        //     this.eventBus.publish(profileCreated);
        // });
    }
}

export default ProfileService;
