import Profile from 'InvestmentAccounts/Domain/ProfileAggregate/Profile';
import { InvestmentAccountDbProvider } from 'InvestmentAccounts/Infrastructure/Storage/DatabaseAdapter';
import { ProfileSnapshotChanged } from 'InvestmentAccounts/Infrastructure/Storage/Queries/Events/ProfileSnapshotChanged';
import { TransactionalAdapter } from 'PostgreSQL/TransactionalAdapter';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';
import { AggregateRepository } from 'SimpleAggregator/Storage/AggregateRepository';
import { AggregateState, DomainEvent } from 'SimpleAggregator/Types';

export class ProfileRepository {
  public static getClassName = (): string => 'ProfileRepository';
  private aggregateRepository: AggregateRepository<InvestmentAccountDbProvider>;
  private tableName = 'investment_accounts_profile_aggregate';
  private transactionalAdapter: TransactionalAdapter<any>;
  private eventBus: EventBus;

  constructor(aggregateRepository: AggregateRepository<InvestmentAccountDbProvider>, transactionalAdapter: TransactionalAdapter<any>, eventBus: EventBus) {
    this.aggregateRepository = aggregateRepository;
    this.transactionalAdapter = transactionalAdapter;
    this.eventBus = eventBus;
  }

  public async storeAndPublish(events: DomainEvent[], snapshot: AggregateState): Promise<void> {
    await this.transactionalAdapter.transaction(`Store and publish aggregate state: ${this.tableName}/${snapshot.aggregateId}`, async () => {
      await this.aggregateRepository.store(this.tableName, snapshot);

      const snapshotChanged = <ProfileSnapshotChanged>{
        id: snapshot.aggregateId,
        kind: 'ProfileSnapshotChanged',
        data: snapshot.state,
      };
      this.eventBus.publishMany(events).publish(snapshotChanged);
    });
  }

  public async restore(profileId: string): Promise<Profile | null> {
    try {
      const aggregateState = await this.aggregateRepository.getAggregateState(this.tableName, profileId);

      return new Profile(aggregateState);
    } catch (error: any) {
      console.log(`Aggregate restoration info: aggregate ${profileId} not exists`);

      return null;
    }
  }
}
