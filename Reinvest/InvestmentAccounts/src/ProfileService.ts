import Profile from "InvestmentAccounts/Profile";
import {DbProvider} from "InvestmentAccounts/Storage/DatabaseAdapter";
import {EventBus} from "SimpleAggregator/EventBus/EventBus";
import {ProfileSnapshotChanged} from "InvestmentAccounts/Storage/Queries/Events/ProfileSnapshotChanged";
import {EventPublisher} from "TechnicalEvents/EventPublisher";


export class ProfileRepository {
    static toString = () => "ProfileRepository";
}

class ProfileService {
    static toString = () => "ProfileService";

    private readonly profileRepository: ProfileRepository;
    private eventBus: EventBus;


    constructor(profileRepository: ProfileRepository, eventBus: EventBus) {
        this.profileRepository = profileRepository;
        this.eventBus = eventBus;
    }

    async create(userId: string) {
        const profile = Profile.create();
        const profileCreated = profile.initialize(userId);
        const database = DbProvider.provide();
        const aggregate = profile.getSnapshot();

        // const {aggregateId} = await database
        //     .insertInto('investment_accounts_profile_aggregate')
        //     .values({...aggregate})
        //     .returning('aggregateId')
        //     .executeTakeFirstOrThrow()
        // console.log({aggregateId});
        const snapshotChanged = <ProfileSnapshotChanged>{
            id: aggregate.aggregateId,
            kind: "ProfileSnapshotChanged",
            data: aggregate.state
        };

        this.eventBus
            .publish(profileCreated)
            .publish(snapshotChanged)

        const technicalPublisher = new EventPublisher();
        await technicalPublisher.publish(JSON.stringify(profileCreated));
        await technicalPublisher.publish(JSON.stringify(snapshotChanged));

        // this.repository.transaction(() => {
        //     this.aggregateService.persist(profile);
        //     this.eventBus.publish(profileCreated);
        // });
    }
}

export default ProfileService;
