import { NotificationsDatabaseAdapterProvider, notificationsTable } from 'Notifications/Adapter/Database/DatabaseAdapter';
import { NotificationsTable } from 'Notifications/Adapter/Database/NotificationsSchema';
import { Pagination } from 'Notifications/Application/Pagination';
import { NotificationsStats } from 'Notifications/Application/UseCase/NotificationQuery';
import { Notification, NotificationSchema } from 'Notifications/Domain/Notification';

export class NotificationsRepository {
  private databaseAdapterProvider: NotificationsDatabaseAdapterProvider;

  constructor(databaseAdapterProvider: NotificationsDatabaseAdapterProvider) {
    this.databaseAdapterProvider = databaseAdapterProvider;
  }

  public static getClassName = (): string => 'NotificationsRepository';

  async store(notification: Notification): Promise<void> {
    const values = <NotificationsTable>notification.toObject();

    await this.databaseAdapterProvider
      .provide()
      .insertInto(notificationsTable)
      .values(values)
      .onConflict(oc => oc.column('uniqueId').doNothing())
      .execute();
  }

  async setReadToTrue(profileId: string, dismissIds: string[]) {
    await this.databaseAdapterProvider
      .provide()
      .updateTable(notificationsTable)
      .set({
        dateRead: new Date(),
        isRead: true,
      })
      .where('profileId', '=', profileId)
      .where('dateRead', 'is', null)
      .where('dismissId', 'in', dismissIds)
      .execute();
  }

  async findAllNotifications(profileId: string, accountId: string, pagination: Pagination) {
    const queryBuilder = this.buildFindNotificationsQuery(profileId, accountId, pagination, null);
    const results = await queryBuilder.execute();

    return results.map((result: NotificationSchema) => Notification.restore(result));
  }

  async findUnreadNotifications(profileId: string, accountId: string, pagination: Pagination) {
    const queryBuilder = this.buildFindNotificationsQuery(profileId, accountId, pagination, false);
    const results = await queryBuilder.execute();

    return results.map((result: NotificationSchema) => Notification.restore(result));
  }

  async getNotificationsStats(profileId: string, accountId: string): Promise<NotificationsStats> {
    const stats = await this.databaseAdapterProvider
      .provide()
      .selectFrom(notificationsTable)
      .select(({ fn }) => ['isRead', fn.count('id').as('counter')])
      .where(`profileId`, '=', profileId)
      .where(qb => qb.where('accountId', '=', accountId).orWhere('accountId', 'is', null))
      .groupBy('isRead')
      .execute();

    let totalCount = 0;
    let unreadCount = 0;

    stats.map((stat: any) => {
      totalCount += parseInt(stat.counter);

      if (stat.isRead === false) {
        unreadCount += parseInt(stat.counter);
      }
    });

    return {
      totalCount,
      unreadCount,
    };
  }

  private buildFindNotificationsQuery(profileId: string, accountId: string, pagination: Pagination, isRead: boolean | null): any {
    const db = this.databaseAdapterProvider.provide();

    const selectedFields = [
      'accountId',
      'body',
      'dateCreated',
      'dateRead',
      'dismissId',
      'header',
      'id',
      'isDismissible',
      'isRead',
      'notificationType',
      'onObjectId',
      'onObjectType',
      'profileId',
      'uniqueId',
    ];

    // @ts-ignore
    let unionSubQuery = db.selectFrom(notificationsTable).where('profileId', '=', profileId).select(selectedFields).where('accountId', 'is', null);

    if (isRead !== null) {
      unionSubQuery = unionSubQuery.where('isRead', '=', isRead);
    }

    let query = db
      .selectFrom(notificationsTable)
      // @ts-ignore
      .select(selectedFields)
      .union(unionSubQuery)
      .where(`${notificationsTable}.accountId`, '=', accountId)
      .where(`${notificationsTable}.profileId`, '=', profileId);

    if (isRead !== null) {
      query = query.where(`${notificationsTable}.isRead`, '=', isRead);
    }

    return query
      .orderBy('dateCreated', 'desc')
      .limit(pagination.perPage)
      .offset(pagination.perPage * pagination.page);
  }
}
