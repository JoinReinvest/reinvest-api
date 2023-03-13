import {AggregateRepository} from "SimpleAggregator/Storage/AggregateRepository";
import {AggregateState, DomainEvent} from "SimpleAggregator/Types";
import {InvestmentAccountDbProvider,} from "InvestmentAccounts/Infrastructure/Storage/DatabaseAdapter";
import {TransactionalAdapter} from "PostgreSQL/TransactionalAdapter";
import Profile from "InvestmentAccounts/Domain/Profile";
import {ProfileSnapshotChanged} from "InvestmentAccounts/Infrastructure/Storage/Queries/Events/ProfileSnapshotChanged";
import {EventBus} from "SimpleAggregator/EventBus/EventBus";

export class ProfileRepository {
    public static getClassName = (): string => "ProfileRepository";
    private aggregateRepository: AggregateRepository<InvestmentAccountDbProvider>;
    private tableName = 'investment_accounts_profile_aggregate';
    private transactionalAdapter: TransactionalAdapter<any>;
    private eventBus: EventBus;

    constructor(
        aggregateRepository: AggregateRepository<InvestmentAccountDbProvider>,
        transactionalAdapter: TransactionalAdapter<any>,
        eventBus: EventBus
    ) {
        this.aggregateRepository = aggregateRepository;
        this.transactionalAdapter = transactionalAdapter;
        this.eventBus = eventBus;
    }

    public async storeAndPublish(events: DomainEvent[], snapshot: AggregateState): Promise<void> {
        await this.transactionalAdapter.transaction(
            `Store and publish aggregate state: ${this.tableName}/${snapshot.aggregateId}`,
            async () => {
                await this.aggregateRepository.store(this.tableName, snapshot);

                const snapshotChanged = <ProfileSnapshotChanged>{
                    id: snapshot.aggregateId,
                    kind: "ProfileSnapshotChanged",
                    data: snapshot.state
                };
                this.eventBus
                    .publishMany(events)
                    .publish(snapshotChanged)
                ;
            });
    }

    public async restore(profileId: string): Promise<Profile | null> {
        try {
            return await this.aggregateRepository.restore<Profile>(this.tableName, profileId);
        } catch (error: any) {
            console.log(`Aggregate restoration info: aggregate ${profileId} not exists`);
            return null;
        }
    }
}