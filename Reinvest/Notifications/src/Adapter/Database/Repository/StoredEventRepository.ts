import { UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { NotificationsDatabaseAdapterProvider, storedEventsTable } from 'Notifications/Adapter/Database/DatabaseAdapter';
import { StoredEventsTable } from 'Notifications/Adapter/Database/NotificationsSchema';
import { StoredEvent, StoredEventSchema } from 'Notifications/Domain/StoredEvent';

export class StoredEventRepository {
  private databaseAdapterProvider: NotificationsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: NotificationsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'StoredEventRepository';

  async getById(id: UUID): Promise<StoredEvent | null> {
    const data = await this.databaseAdapterProvider.provide().selectFrom(storedEventsTable).selectAll().where('id', '=', id).executeTakeFirst();

    if (!data) {
      return null;
    }

    return this.restoreFromTableSchema(data);
  }

  async store(storedEvent: StoredEvent) {
    const values = this.castToTableSchema(storedEvent);
    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(storedEventsTable)
        .values(values)
        .onConflict(oc =>
          oc.column('id').doUpdateSet({
            dateAccountActivity: eb => eb.ref(`excluded.dateAccountActivity`),
            dateAnalytics: eb => eb.ref(`excluded.dateAnalytics`),
            dateEmailed: eb => eb.ref(`excluded.dateEmailed`),
            dateInApp: eb => eb.ref(`excluded.dateInApp`),
            datePushed: eb => eb.ref(`excluded.datePushed`),
          }),
        )
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot store event ${values.profileId}/${values.id}`, error);

      return false;
    }
  }

  private castToTableSchema(storedEvent: StoredEvent): StoredEventsTable {
    const { payload: payloadJson, ...rest } = storedEvent.toObject();

    return <StoredEventsTable>{
      ...rest,
      payloadJson,
      dateCreated: rest.dateCreated.toDate(),
      dateAccountActivity: rest.dateAccountActivity ? rest.dateAccountActivity.toDate() : null,
      dateAnalytics: rest.dateAnalytics ? rest.dateAnalytics.toDate() : null,
      dateEmailed: rest.dateEmailed ? rest.dateEmailed.toDate() : null,
      dateInApp: rest.dateInApp ? rest.dateInApp.toDate() : null,
      datePushed: rest.datePushed ? rest.datePushed.toDate() : null,
    };
  }

  private restoreFromTableSchema(data: StoredEventsTable): StoredEvent {
    const { payloadJson: payload, ...rest } = data;
    const schema = <StoredEventSchema>{
      ...rest,
      dateCreated: DateTime.from(data.dateCreated),
      dateAccountActivity: data.dateAccountActivity ? DateTime.from(data.dateAccountActivity) : null,
      dateAnalytics: data.dateAnalytics ? DateTime.from(data.dateAnalytics) : null,
      dateEmailed: data.dateEmailed ? DateTime.from(data.dateEmailed) : null,
      dateInApp: data.dateInApp ? DateTime.from(data.dateInApp) : null,
      datePushed: data.datePushed ? DateTime.from(data.datePushed) : null,
      payload,
    };

    return StoredEvent.restore(schema);
  }
}
