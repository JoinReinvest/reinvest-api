import { Pagination, UUID } from 'HKEKTypes/Generics';
import { DateTime } from 'Money/DateTime';
import { accountActivitiesTable, NotificationsDatabaseAdapterProvider } from 'Notifications/Adapter/Database/DatabaseAdapter';
import { AccountActivitiesTable } from 'Notifications/Adapter/Database/NotificationsSchema';
import { AccountActivity, AccountActivitySchema } from 'Notifications/Domain/AccountActivity';

export class AccountActivitiesRepository {
  private databaseAdapterProvider: NotificationsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: NotificationsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'AccountActivitiesRepository';

  async listActivities(
    profileId: UUID,
    accountId: UUID,
    pagination: Pagination = {
      page: 0,
      perPage: 10,
    },
  ): Promise<AccountActivity[]> {
    const data = await this.databaseAdapterProvider
      .provide()
      .selectFrom(accountActivitiesTable)
      .selectAll()
      .where('profileId', '=', profileId)
      .where(oc => oc.where('accountId', '=', accountId).orWhere('accountId', 'is', null))
      .orderBy('activityDate', 'desc')
      .limit(pagination.perPage)
      .offset(pagination.perPage * pagination.page)
      .execute();

    if (!data) {
      return [];
    }

    return data.map(record => this.restoreFromTableSchema(record));
  }

  async store(accountActivity: AccountActivity) {
    const values = this.castToTableSchema(accountActivity);
    try {
      await this.databaseAdapterProvider
        .provide()
        .insertInto(accountActivitiesTable)
        .values(values)
        .onConflict(oc => oc.column('hash').doNothing())
        .execute();

      return true;
    } catch (error: any) {
      console.error(`Cannot store activity ${values.profileId}/${values.hash}`, error);

      return false;
    }
  }

  private castToTableSchema(accountActivity: AccountActivity): AccountActivitiesTable {
    const data = accountActivity.toObject();

    return <AccountActivitiesTable>{
      ...data,
      activityDate: data.activityDate.toDate(),
    };
  }

  private restoreFromTableSchema(data: AccountActivitiesTable): AccountActivity {
    const schema = <AccountActivitySchema>{
      ...data,
      activityDate: DateTime.from(data.activityDate),
    };

    return AccountActivity.restore(schema);
  }
}
