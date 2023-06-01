import { Kysely, sql } from 'kysely';
import { NotificationsDatabase, notificationsTable } from 'Notifications/Adapter/Database/DatabaseAdapter';

export async function up(db: Kysely<NotificationsDatabase>): Promise<void> {
  await db.schema
    .createTable(notificationsTable)
    .addColumn('id', 'uuid', col => col.primaryKey())
    .addColumn('profileId', 'uuid', col => col.notNull())
    .addColumn('accountId', 'uuid', col => col.defaultTo(null))
    .addColumn('dismissId', 'uuid', col => col.notNull())
    .addColumn('uniqueId', 'uuid', col => col.defaultTo(null).unique())
    .addColumn('isRead', 'boolean', col => col.defaultTo(false))
    .addColumn('isDismissible', 'boolean', col => col.defaultTo(false))
    .addColumn('onObjectId', 'uuid', col => col.defaultTo(null))
    .addColumn('onObjectType', 'varchar(36)', col => col.defaultTo(null))
    .addColumn('dateCreated', 'timestamp', col => col.notNull().defaultTo(sql`now()`))
    .addColumn('dateRead', 'timestamp', col => col.defaultTo(null))
    .addColumn('notificationType', 'varchar(64)', col => col.notNull())
    .addColumn('header', 'text', col => col.notNull())
    .addColumn('body', 'text', col => col.notNull())
    .execute();

  await db.schema.createIndex('notifications_profile_id').on(notificationsTable).columns(['profileId', 'accountId']).execute();
}

export async function down(db: Kysely<NotificationsDatabase>): Promise<void> {
  await db.schema.dropIndex('notifications_profile_id').execute();
  await db.schema.dropTable(notificationsTable).execute();
}
