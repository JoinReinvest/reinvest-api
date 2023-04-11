import { DatabaseProvider } from 'PostgreSQL/DatabaseProvider';
import { AggregateException } from 'SimpleAggregator/AggregateException';
import { AggregateState } from 'SimpleAggregator/Types';

export class AggregateRepository<DatabaseProviderType extends DatabaseProvider<any>> {
  private databaseProvider: DatabaseProviderType;

  constructor(databaseProvider: DatabaseProviderType) {
    this.databaseProvider = databaseProvider;
  }

  public static getClassName = (): string => 'AggregateRepository';

  public async store(tableName: string, snapshot: AggregateState): Promise<void | never> {
    const snapshotState = snapshot['state'] ? snapshot.state : {};
    const aggregate = { ...snapshot };
    const currentVersion = snapshot.currentVersion;
    const previousVersion = snapshot.previousVersion;
    const dateUpdated = snapshot.dateUpdated;
    const currentDate = new Date();
    aggregate['state'] = JSON.stringify(snapshotState);
    aggregate['previousVersion'] = currentVersion;
    aggregate['dateUpdated'] = currentDate;

    const updated = await this.databaseProvider
      .provide()
      .insertInto(tableName)
      .values({ ...aggregate })
      .onConflict(oc =>
        oc
          .column('aggregateId')
          .doUpdateSet({
            state: aggregate.state,
            currentVersion: aggregate.currentVersion,
            previousVersion: aggregate.previousVersion,
            dateUpdated: aggregate.dateUpdated,
          })
          .where(`${tableName}.previousVersion`, '=', previousVersion)
          .where(`${tableName}.dateUpdated`, '=', dateUpdated),
      )
      .returning('dateUpdated')
      .executeTakeFirst();

    if (!updated) {
      throw new AggregateException('Aggregate race conditioning exception');
    }
  }

  public async getAggregateState(tableName: string, aggregateId: string): Promise<AggregateState | never> {
    const data = await this.databaseProvider
      .provide()
      .selectFrom(tableName)
      .select(['kind', 'dateCreated', 'dateUpdated', 'aggregateId', 'currentVersion', 'previousVersion', 'state'])
      .where('aggregateId', '=', aggregateId)
      .limit(1)
      .executeTakeFirst();

    if (!data) {
      throw new AggregateException(`Aggregate "${aggregateId} not exist`);
    }

    return <AggregateState>data;
  }
}
