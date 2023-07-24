import { ArchivingBeneficiaryTable } from 'Archiving/Adapter/Database/ArchivingSchema';
import { archivingBeneficiary, ArchivingDatabaseAdapterProvider } from 'Archiving/Adapter/Database/DatabaseAdapter';
import {
  AccountArchivingState,
  ArchivedBeneficiary,
  ArchivingBeneficiarySchema,
  ArchivingBeneficiaryStatus,
  VertaloConfiguration,
} from 'Archiving/Domain/ArchivedBeneficiary';
import { JSONObjectOf, UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { EventBus } from 'SimpleAggregator/EventBus/EventBus';
import { DomainEvent } from 'SimpleAggregator/Types';

export type ArchivingBeneficiaryIds = { accountId: UUID; profileId: UUID };

export class ArchivingBeneficiaryRepository {
  public static getClassName = (): string => 'ArchivingBeneficiaryRepository';

  private databaseAdapterProvider: ArchivingDatabaseAdapterProvider;
  private eventsPublisher: EventBus;

  constructor(archivingDatabaseAdapterProvider: ArchivingDatabaseAdapterProvider, eventsPublisher: EventBus) {
    this.databaseAdapterProvider = archivingDatabaseAdapterProvider;
    this.eventsPublisher = eventsPublisher;
  }

  async getBy(profileId: string, accountId: string): Promise<ArchivedBeneficiary | null> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(archivingBeneficiary)
      .selectAll()
      .where('profileId', '=', profileId)
      .where('accountId', '=', accountId)
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return this.castToObject(data);
  }

  async store(archivedBeneficiary: ArchivedBeneficiary, events: DomainEvent[] = []): Promise<boolean> {
    const values = this.castToTable(archivedBeneficiary);
    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(archivingBeneficiary)
        .values(values)
        .onConflict(oc =>
          oc.constraint('unique_profile_account').doUpdateSet({
            vertaloConfigurationJson: eb => eb.ref(`excluded.vertaloConfigurationJson`),
            accountArchivingStateJson: eb => eb.ref(`excluded.accountArchivingStateJson`),
            dateCompleted: eb => eb.ref(`excluded.dateCompleted`),
            status: eb => eb.ref(`excluded.status`),
          }),
        )
        .execute();

      await this.publishEvents(events);

      return true;
    } catch (error: any) {
      console.error(`Cannot store beneficiary archiving record`, error);

      return false;
    }
  }

  private castToObject(tableData: ArchivingBeneficiaryTable): ArchivedBeneficiary {
    const { accountArchivingStateJson, vertaloConfigurationJson, ...data } = tableData;

    return ArchivedBeneficiary.restore(<ArchivingBeneficiarySchema>{
      ...data,
      accountArchivingState: accountArchivingStateJson as AccountArchivingState,
      vertaloConfiguration: vertaloConfigurationJson as VertaloConfiguration,
      dateCreated: DateTime.from(data.dateCreated),
      dateCompleted: data.dateCompleted ? DateTime.from(data.dateCompleted) : null,
    });
  }

  private castToTable(object: ArchivedBeneficiary): ArchivingBeneficiaryTable {
    const { accountArchivingState, vertaloConfiguration, ...data } = object.toObject();

    return <ArchivingBeneficiaryTable>{
      ...data,
      accountArchivingStateJson: accountArchivingState as JSONObjectOf<AccountArchivingState>,
      vertaloConfigurationJson: vertaloConfiguration as JSONObjectOf<VertaloConfiguration>,
      dateCreated: data.dateCreated.toDate(),
      dateCompleted: data.dateCompleted ? data.dateCompleted.toDate() : null,
    };
  }

  async publishEvents(events: DomainEvent[] = []): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await this.eventsPublisher.publishMany(events);
  }

  async getPendingArchivingBeneficiaries(): Promise<ArchivingBeneficiaryIds[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(archivingBeneficiary)
      .select(['profileId', 'accountId'])
      .where('status', '=', ArchivingBeneficiaryStatus.IN_PROGRESS)
      .execute();

    if (!data) {
      return [];
    }

    return data.map(({ profileId, accountId }) => ({ profileId, accountId }));
  }
}
