import { Kysely } from 'kysely';
import { accountActivitiesTable, NotificationsDatabase } from 'Notifications/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<NotificationsDatabase>): Promise<void> {
  await db.schema
    .createTable(accountActivitiesTable)
    .addColumn('accountId', 'uuid', col => col.defaultTo(null))
    .addColumn('activityDate', 'timestamp', col => col.notNull())
    .addColumn('activityName', 'varchar(255)', col => col.notNull())
    .addColumn('dataJson', 'json', col => col.defaultTo(null))
    .addColumn('hash', 'varchar(255)', col => col.primaryKey())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<NotificationsDatabase>): Promise<void> {
  await db.schema.dropTable(accountActivitiesTable).execute();
}
