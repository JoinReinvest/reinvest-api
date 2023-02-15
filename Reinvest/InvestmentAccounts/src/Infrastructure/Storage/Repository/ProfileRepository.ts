import {AggregateRepository} from "SimpleAggregator/Storage/AggregateRepository";
import {AggregateState, DomainEvent} from "SimpleAggregator/Types";
import {
    InvestmentAccountDbProvider,
} from "InvestmentAccounts/Infrastructure/Storage/DatabaseAdapter";
import {TransactionalAdapter} from "InvestmentAccounts/Infrastructure/Storage/TransactionalAdapter";
import Profile from "InvestmentAccounts/Domain/Profile";
import {ProfileSnapshotChanged} from "InvestmentAccounts/Infrastructure/Storage/Queries/Events/ProfileSnapshotChanged";
import {EventBus} from "SimpleAggregator/EventBus/EventBus";

export class ProfileRepository {
    public static getClassName = (): string => "ProfileRepository";
    private aggregateRepository: AggregateRepository<InvestmentAccountDbProvider>;
    private tableName = 'investment_accounts_profile_aggregate';
    private transactionalAdapter: TransactionalAdapter;
    private eventBus: EventBus;

    constructor(
        aggregateRepository: AggregateRepository<InvestmentAccountDbProvider>,
        transactionalAdapter: TransactionalAdapter,
        eventBus: EventBus
    ) {
        this.aggregateRepository = aggregateRepository;
        this.transactionalAdapter = transactionalAdapter;
        this.eventBus = eventBus;
    }

    public async storeAndPublish(events: [DomainEvent], snapshot: AggregateState): Promise<void> {
        await this.transactionalAdapter.transaction(async () => {
            await this.aggregateRepository.store(this.tableName, snapshot);

            const snapshotChanged = <ProfileSnapshotChanged>{
                id: snapshot.aggregateId,
                kind: "ProfileSnapshotChanged",
                data: snapshot.state
            };

            this.eventBus
                .publishMany(events)
                .publish(snapshotChanged)
        });
    }

    public async restore(profileId: string): Promise<Profile | null> {
        try {
            return await this.aggregateRepository.restore<Profile>(this.tableName, profileId);
        } catch (error: any) {
            return null;
        }
    }
}